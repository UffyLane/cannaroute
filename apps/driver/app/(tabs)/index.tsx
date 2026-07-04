import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { DeliveryService } from '@/services/delivery.service';
import { Delivery } from '@/types';

function DeliveryStatusPill({ status }: { status: string }) {
  const isActive = status === 'assigned' || status === 'en_route_to_dispensary' || status === 'picked_up' || status === 'en_route_to_customer';
  return (
    <View className={['px-2.5 py-0.5 rounded-full', isActive ? 'bg-green-100' : 'bg-neutral-100'].join(' ')}>
      <Text className={['text-xs font-medium', isActive ? 'text-green-700' : 'text-neutral-500'].join(' ')}>
        {status.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}

export default function DeliveryQueueScreen() {
  const { data: deliveries = [], isLoading, refetch, isRefetching } = useQuery<Delivery[]>({
    queryKey: ['deliveries', 'active'],
    queryFn: DeliveryService.getMyDeliveries,
    refetchInterval: 20_000,
  });

  const active = deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'failed');

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100">
        <Text className="text-2xl font-bold text-neutral-900">Delivery Queue</Text>
        <Text className="text-sm text-neutral-500 mt-0.5">
          {active.length} active assignment{active.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-4xl mb-3">🚗</Text>
          <Text className="text-sm text-neutral-400">Loading deliveries...</Text>
        </View>
      ) : (
        <FlatList
          data={active}
          keyExtractor={(item: Delivery) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0f4c35" />
          }
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }: { item: Delivery }) => (
            <TouchableOpacity
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 mb-3"
              activeOpacity={0.85}
              onPress={() => router.push(`/delivery/${item.id}`)}
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-neutral-900">
                    📍 {item.dispensaryName}
                  </Text>
                  <Text className="text-xs text-neutral-500 mt-0.5">{item.dispensaryAddress}</Text>
                </View>
                <DeliveryStatusPill status={item.status} />
              </View>

              <View className="border-t border-neutral-100 pt-3 flex-row items-center justify-between">
                <Text className="text-sm text-neutral-600">
                  {item.stops.length} stop{item.stops.length !== 1 ? 's' : ''}
                </Text>
                <Text className="text-sm font-semibold text-brand-900">View →</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-5xl mb-4">✅</Text>
              <Text className="text-base font-semibold text-neutral-700">All caught up!</Text>
              <Text className="text-sm text-neutral-400 mt-1">No deliveries assigned right now</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
