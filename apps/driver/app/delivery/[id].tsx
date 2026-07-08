import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { io, Socket } from 'socket.io-client';
import Toast from 'react-native-toast-message';
import { DeliveryService } from '@/services/delivery.service';
import { DeliveryStop, DeliveryStatus } from '@/types';

const BG      = '#060f08';
const SURFACE = 'rgba(255,255,255,0.05)';
const BORDER  = 'rgba(255,255,255,0.10)';
const GREEN   = '#0f4c35';
const GOLD    = '#f59e0b';
const WHITE   = '#ffffff';
const MUTED   = 'rgba(255,255,255,0.45)';

const STATUS_ACTIONS: Partial<Record<DeliveryStatus, { label: string; next: DeliveryStatus }>> = {
  assigned:               { label: 'Head to Dispensary', next: 'en_route_to_dispensary' },
  en_route_to_dispensary: { label: 'Picked Up Order',    next: 'picked_up' },
  picked_up:              { label: 'Start Delivery',      next: 'en_route_to_customer' },
  en_route_to_customer:   { label: 'Mark Delivered',      next: 'delivered' },
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
      <View style={[styles.root, styles.loadingScreen]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );
  }

  const currentStop = delivery.stops[activeStopIndex];
  const action = currentStop ? STATUS_ACTIONS[currentStop.status] : null;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Pickup card */}
          <View style={styles.pickupCard}>
            <Text style={styles.pickupLabel}>Pickup From</Text>
            <Text style={styles.pickupName}>{delivery.dispensaryName}</Text>
            <Text style={styles.pickupAddress}>{delivery.dispensaryAddress}</Text>
          </View>

          {/* Stop selector */}
          <View style={styles.stopSelector}>
            {delivery.stops.map((stop, index) => (
              <TouchableOpacity
                key={stop.id}
                onPress={() => setActiveStopIndex(index)}
                style={[
                  styles.stopTab,
                  activeStopIndex === index ? styles.stopTabActive : styles.stopTabInactive,
                ]}
              >
                <Text style={[
                  styles.stopTabText,
                  activeStopIndex === index ? styles.stopTabTextActive : styles.stopTabTextInactive,
                ]}>
                  Stop {index + 1}
                </Text>
                {stop.status === 'delivered' && (
                  <Text style={styles.stopDoneText}>✓ Done</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Current stop details */}
          {currentStop && (
            <View style={styles.stopCard}>
              <Text style={styles.customerName}>{currentStop.customerName}</Text>
              <Text style={styles.address}>{currentStop.deliveryAddress}</Text>
              <Text style={styles.address}>
                {currentStop.city}, {currentStop.state} {currentStop.zipCode}
              </Text>
              <Text style={styles.phone}>📞 {currentStop.customerPhone}</Text>

              {currentStop.specialInstructions ? (
                <View style={styles.instructionsBox}>
                  <Text style={styles.instructionsLabel}>Special Instructions</Text>
                  <Text style={styles.instructionsText}>{currentStop.specialInstructions}</Text>
                </View>
              ) : null}

              {/* Order items */}
              <View style={styles.itemsDivider} />
              <Text style={styles.itemsLabel}>Order Items</Text>
              {currentStop.items.map((item, i) => (
                <Text key={i} style={styles.itemRow}>
                  {item.quantity}× {item.name} ({item.weightGrams}g)
                </Text>
              ))}

              {/* Proof of delivery */}
              {currentStop.status === 'en_route_to_customer' && (
                <TouchableOpacity
                  style={styles.photoBtn}
                  onPress={() => handlePhotoUpload(currentStop)}
                >
                  <Text style={styles.photoBtnText}>📷 Upload Proof of Delivery</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* Action CTA */}
        {action && currentStop && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actionBtn, isPending && styles.actionBtnDisabled]}
              onPress={() => {
                Alert.alert('Confirm', `Mark as: ${action.label}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Confirm', onPress: () => updateStop({ stopId: currentStop.id, status: action.next }) },
                ]);
              }}
              disabled={isPending}
              activeOpacity={0.85}
            >
              {isPending ? (
                <ActivityIndicator color="#0a1a0f" />
              ) : (
                <Text style={styles.actionBtnText}>{action.label}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  loadingScreen: { alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1 },
  scroll: { flex: 1, padding: 16 },

  // Pickup card
  pickupCard: {
    backgroundColor: 'rgba(15,76,53,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(15,76,53,0.80)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  pickupLabel:   { fontSize: 11, fontWeight: '700', color: 'rgba(110,231,183,0.70)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  pickupName:    { fontSize: 16, fontWeight: '700', color: WHITE },
  pickupAddress: { fontSize: 13, color: 'rgba(255,255,255,0.60)', marginTop: 4 },

  // Stop selector
  stopSelector: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  stopTab: {
    flex: 1, paddingVertical: 10,
    borderRadius: 12, alignItems: 'center',
    borderWidth: 1,
  },
  stopTabActive:   { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.40)' },
  stopTabInactive: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: BORDER },
  stopTabText:         { fontSize: 13, fontWeight: '600' },
  stopTabTextActive:   { color: GOLD },
  stopTabTextInactive: { color: MUTED },
  stopDoneText: { fontSize: 11, color: '#4ade80', marginTop: 2 },

  // Stop details card
  stopCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: BORDER,
    borderRadius: 18, padding: 16,
    marginBottom: 16,
  },
  customerName: { fontSize: 15, fontWeight: '700', color: WHITE, marginBottom: 4 },
  address:      { fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 20 },
  phone:        { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.70)', marginTop: 10 },

  instructionsBox: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.22)',
    borderRadius: 12, padding: 12, marginTop: 12,
  },
  instructionsLabel: { fontSize: 11, fontWeight: '700', color: GOLD, marginBottom: 4 },
  instructionsText:  { fontSize: 12, color: 'rgba(245,158,11,0.80)', lineHeight: 18 },

  itemsDivider: { height: 1, backgroundColor: BORDER, marginVertical: 12 },
  itemsLabel:   { fontSize: 11, fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  itemRow:      { fontSize: 13, color: 'rgba(255,255,255,0.70)', marginBottom: 4 },

  photoBtn: {
    marginTop: 14,
    borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, paddingVertical: 12,
    alignItems: 'center',
  },
  photoBtnText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.70)' },

  // Footer action
  footer: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: BORDER,
    backgroundColor: '#080f0a',
  },
  actionBtn: {
    backgroundColor: GOLD, borderRadius: 16,
    paddingVertical: 17, alignItems: 'center', justifyContent: 'center',
  },
  actionBtnDisabled: { opacity: 0.60 },
  actionBtnText: { color: '#0a1a0f', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});
