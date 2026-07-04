import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/services/order.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Order, OrderStatus } from '@/types';

const statusBadgeVariant: Record<OrderStatus, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready_for_pickup: 'info',
  in_transit: 'brand' as never,
  delivered: 'success',
  cancelled: 'error',
};

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready',
  in_transit: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrdersScreen() {
  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders'],
    queryFn: OrderService.getOrders,
  });

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100">
        <Text className="text-2xl font-bold text-neutral-900">Your Orders</Text>
      </View>

      {isLoading ? (
        <LoadingSpinner message="Loading orders..." />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item: Order) => item.id}
          renderItem={({ item }: { item: Order }) => (
            <TouchableOpacity
              className="bg-white mx-4 my-1.5 rounded-2xl p-4 border border-neutral-100"
              activeOpacity={0.8}
              onPress={() =>
                item.status === 'in_transit'
                  ? router.push(`/track/${item.id}`)
                  : undefined
              }
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-neutral-900">
                    {item.dispensaryName}
                  </Text>
                  <Text className="text-xs text-neutral-400 mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <Badge
                  label={statusLabel[item.status]}
                  variant={statusBadgeVariant[item.status]}
                />
              </View>

              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-neutral-500">
                  {item.items.length} item{item.items.length !== 1 ? 's' : ''}
                </Text>
                <Text className="text-base font-bold text-neutral-900">
                  ${item.total.toFixed(2)}
                </Text>
              </View>

              {item.status === 'in_transit' && (
                <TouchableOpacity
                  className="mt-3 bg-brand-50 border border-brand-200 rounded-xl py-2 items-center"
                  onPress={() => router.push(`/track/${item.id}`)}
                >
                  <Text className="text-sm font-semibold text-brand-800">📍 Track Delivery</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0f4c35" />
          }
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-5xl mb-4">📋</Text>
              <Text className="text-base font-semibold text-neutral-700">No orders yet</Text>
              <Text className="text-sm text-neutral-400 mt-1">
                Browse dispensaries and place your first order
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
