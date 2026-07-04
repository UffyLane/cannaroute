import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { io, Socket } from 'socket.io-client';
import Toast from 'react-native-toast-message';
import { DeliveryService } from '@/services/delivery.service';
import { DeliveryStop, DeliveryStatus } from '@/types';

const STATUS_ACTIONS: Partial<Record<DeliveryStatus, { label: string; next: DeliveryStatus }>> = {
  assigned: { label: 'Head to Dispensary', next: 'en_route_to_dispensary' },
  en_route_to_dispensary: { label: 'Picked Up Order', next: 'picked_up' },
  picked_up: { label: 'Start Delivery', next: 'en_route_to_customer' },
  en_route_to_customer: { label: 'Mark Delivered', next: 'delivered' },
};

export default function ActiveDeliveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const locationWatcher = useRef<Location.LocationSubscription | null>(null);
  const [activeStopIndex, setActiveStopIndex] = useState(0);

  const { data: delivery, isLoading } = useQuery({
    queryKey: ['delivery', id],
    queryFn: () => DeliveryService.getMyDeliveries().then((d) => d.find((x) => x.id === id) ?? null),
  });

  const { mutate: updateStop, isPending } = useMutation({
    mutationFn: ({ stopId, status }: { stopId: string; status: DeliveryStatus }) =>
      DeliveryService.updateStopStatus(id, stopId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', id] });
      Toast.show({ type: 'success', text1: 'Status updated' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to update status' }),
  });

  // GPS broadcasting
  useEffect(() => {
    let mounted = true;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const socket: Socket = io(`${process.env.EXPO_PUBLIC_SOCKET_URL}/orders`, {
        transports: ['websocket'],
      });
      socketRef.current = socket;

      locationWatcher.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (loc) => {
          if (mounted) {
            socket.emit('driver_location', {
              deliveryId: id,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              heading: loc.coords.heading,
              speed: loc.coords.speed,
            });
          }
        },
      );
    };

    startTracking();

    return () => {
      mounted = false;
      locationWatcher.current?.remove();
      socketRef.current?.disconnect();
    };
  }, [id]);

  const handlePhotoUpload = async (stop: DeliveryStop) => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    try {
      await DeliveryService.uploadProofOfDelivery(id, stop.id, result.assets[0].uri);
      Toast.show({ type: 'success', text1: 'Photo uploaded' });
      queryClient.invalidateQueries({ queryKey: ['delivery', id] });
    } catch {
      Toast.show({ type: 'error', text1: 'Photo upload failed' });
    }
  };

  if (isLoading || !delivery) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0f4c35" />
      </SafeAreaView>
    );
  }

  const currentStop = delivery.stops[activeStopIndex];
  const action = currentStop ? STATUS_ACTIONS[currentStop.status] : null;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Pickup location */}
        <View className="bg-brand-900 rounded-2xl p-4 mb-4">
          <Text className="text-brand-300 text-xs font-medium uppercase tracking-wider mb-1">
            Pickup From
          </Text>
          <Text className="text-white font-semibold text-base">{delivery.dispensaryName}</Text>
          <Text className="text-brand-300 text-sm mt-0.5">{delivery.dispensaryAddress}</Text>
        </View>

        {/* Stop selector */}
        <View className="flex-row mb-4 gap-2">
          {delivery.stops.map((stop, index) => (
            <TouchableOpacity
              key={stop.id}
              onPress={() => setActiveStopIndex(index)}
              className={[
                'flex-1 py-2.5 rounded-xl items-center border',
                activeStopIndex === index
                  ? 'bg-brand-900 border-brand-900'
                  : 'bg-white border-neutral-200',
              ].join(' ')}
            >
              <Text
                className={[
                  'text-sm font-medium',
                  activeStopIndex === index ? 'text-white' : 'text-neutral-600',
                ].join(' ')}
              >
                Stop {index + 1}
              </Text>
              {stop.status === 'delivered' && (
                <Text className="text-xs text-green-400 mt-0.5">✓ Done</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Current stop details */}
        {currentStop && (
          <View className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4">
            <Text className="text-sm font-semibold text-neutral-900 mb-1">
              {currentStop.customerName}
            </Text>
            <Text className="text-sm text-neutral-600">{currentStop.deliveryAddress}</Text>
            <Text className="text-sm text-neutral-600">
              {currentStop.city}, {currentStop.state} {currentStop.zipCode}
            </Text>
            <Text className="text-sm font-medium text-neutral-700 mt-1">
              📞 {currentStop.customerPhone}
            </Text>

            {currentStop.specialInstructions && (
              <View className="bg-amber-50 rounded-xl p-3 mt-3">
                <Text className="text-xs font-semibold text-amber-700">Special Instructions</Text>
                <Text className="text-xs text-amber-700 mt-0.5">{currentStop.specialInstructions}</Text>
              </View>
            )}

            {/* Items */}
            <View className="mt-3 border-t border-neutral-100 pt-3">
              <Text className="text-xs font-semibold text-neutral-500 mb-2">Order Items</Text>
              {currentStop.items.map((item, i) => (
                <Text key={i} className="text-sm text-neutral-700">
                  {item.quantity}× {item.name} ({item.weightGrams}g)
                </Text>
              ))}
            </View>

            {/* Proof of delivery */}
            {currentStop.status === 'en_route_to_customer' && (
              <TouchableOpacity
                className="mt-4 border border-neutral-200 rounded-xl py-3 items-center"
                onPress={() => handlePhotoUpload(currentStop)}
              >
                <Text className="text-sm font-medium text-neutral-700">📷 Upload Proof of Delivery</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action button */}
      {action && currentStop && (
        <View className="px-4 py-4 bg-white border-t border-neutral-100">
          <TouchableOpacity
            className="bg-brand-900 rounded-xl py-4 items-center"
            onPress={() => {
              Alert.alert('Confirm', `Mark as: ${action.label}?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  onPress: () => updateStop({ stopId: currentStop.id, status: action.next }),
                },
              ]);
            }}
            disabled={isPending}
            activeOpacity={0.85}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">{action.label}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
