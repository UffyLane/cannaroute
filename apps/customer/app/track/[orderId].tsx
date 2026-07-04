import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { OrderService } from '@/services/order.service';
import { OrderStatusTracker } from '@/components/order/OrderStatusTracker';
import { Card } from '@/components/ui/Card';
import { Config } from '@/constants/config';
import { DriverLocation } from '@/types';
import { Colors } from '@/constants/colors';

export default function TrackOrderScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrderById(orderId),
    refetchInterval: 30_000,
  });

  const { data: tracking } = useQuery({
    queryKey: ['tracking', orderId],
    queryFn: () => OrderService.getDeliveryTracking(orderId),
    refetchInterval: 15_000,
    enabled: order?.status === 'in_transit',
  });

  // Real-time GPS via Socket.IO
  useEffect(() => {
    const socket: Socket = io(`${Config.socketUrl}/orders`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('track_order', { orderId });

    socket.on('driver_location', (location: DriverLocation) => {
      queryClient.setQueryData(['tracking', orderId], (prev: typeof tracking) =>
        prev ? { ...prev, currentLocation: location } : prev,
      );
    });

    socket.on('order_status', () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, queryClient]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.brand[900]} />
      </SafeAreaView>
    );
  }

  if (!order) return null;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <View className="flex-1 px-5 pt-4">
        {/* Status tracker */}
        <Card>
          <Text className="text-base font-semibold text-neutral-900 mb-4">Order Status</Text>
          <OrderStatusTracker status={order.status} />

          {tracking?.estimatedArrivalMinutes !== undefined && order.status === 'in_transit' && (
            <View className="mt-4 bg-brand-50 rounded-xl px-4 py-3 items-center">
              <Text className="text-2xl font-bold text-brand-900">
                {tracking.estimatedArrivalMinutes} min
              </Text>
              <Text className="text-sm text-brand-700 mt-0.5">estimated arrival</Text>
            </View>
          )}
        </Card>

        {/* Driver info */}
        {tracking && order.status === 'in_transit' && (
          <Card style={{ marginTop: 12 }}>
            <Text className="text-sm font-semibold text-neutral-700 mb-3">Your Driver</Text>
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-brand-100 items-center justify-center mr-3">
                <Text className="text-lg">🚗</Text>
              </View>
              <View>
                <Text className="text-sm font-semibold text-neutral-900">{tracking.driverName}</Text>
                {tracking.driverPhone && (
                  <Text className="text-xs text-neutral-500 mt-0.5">{tracking.driverPhone}</Text>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Order summary */}
        <Card style={{ marginTop: 12 }}>
          <Text className="text-sm font-semibold text-neutral-700 mb-3">Order Details</Text>
          <Text className="text-xs text-neutral-400 mb-2">#{order.id.slice(0, 8).toUpperCase()}</Text>

          {order.items.map((item) => (
            <View key={item.id} className="flex-row justify-between py-1.5">
              <Text className="text-sm text-neutral-700">
                {item.quantity}× {item.productName}
              </Text>
              <Text className="text-sm text-neutral-900 font-medium">
                ${(item.pricePerUnit * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View className="border-t border-neutral-100 mt-2 pt-3 flex-row justify-between">
            <Text className="text-sm font-bold text-neutral-900">Total</Text>
            <Text className="text-sm font-bold text-neutral-900">${order.total.toFixed(2)}</Text>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}
