import React from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { DeliveryService } from '@/services/delivery.service';
import { Delivery } from '@/types';

export default function DeliveryHistoryScreen() {
  const { data: deliveries = [], isLoading, refetch, isRefetching } = useQuery<Delivery[]>({
    queryKey: ['deliveries', 'all'],
    queryFn: DeliveryService.getMyDeliveries,
  });

  const completed = deliveries.filter((d) => d.status === 'delivered' || d.status === 'failed');

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100">
        <Text className="text-2xl font-bold text-neutral-900">Delivery History</Text>
        <Text className="text-sm text-neutral-500 mt-0.5">{completed.length} completed</Text>
      </View>

      <FlatList
        data={completed}
        keyExtractor={(item: Delivery) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0f4c35" />}
        renderItem={({ item }: { item: Delivery }) => (
          <View className="bg-white rounded-2xl border border-neutral-100 p-4 mb-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-sm font-semibold text-neutral-900">{item.dispensaryName}</Text>
              <View className={['px-2.5 py-0.5 rounded-full', item.status === 'delivered' ? 'bg-green-100' : 'bg-red-100'].join(' ')}>
                <Text className={['text-xs font-medium', item.status === 'delivered' ? 'text-green-700' : 'text-red-700'].join(' ')}>
                  {item.status === 'delivered' ? 'Delivered' : 'Failed'}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-neutral-400 mt-1">
              {item.stops.length} stop{item.stops.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <View className="items-center py-20">
              <Text className="text-4xl mb-3">📦</Text>
              <Text className="text-sm text-neutral-400">No completed deliveries yet</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
