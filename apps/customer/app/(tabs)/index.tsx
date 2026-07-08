import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { InventoryService } from '@/services/inventory.service';
import { DispensaryCard } from '@/components/dispensary/DispensaryCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { Dispensary } from '@/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dispensaries'],
    queryFn: () => InventoryService.getDispensaries({ limit: 20 }),
  });

  const dispensaries = data?.data ?? [];

  const filtered = search.trim()
    ? dispensaries.filter((d: Dispensary) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.city.toLowerCase().includes(search.toLowerCase()),
      )
    : dispensaries;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100">
        <Text className="text-2xl font-bold text-neutral-900">
          Hi {user?.firstName ?? 'there'} 👋
        </Text>
        <Text className="text-sm text-neutral-500 mt-0.5">
          Find cannabis delivered to your door
        </Text>

        {/* Search */}
        <View className="mt-3 bg-neutral-100 rounded-xl px-4 flex-row items-center">
          <Text className="text-neutral-400 mr-2">🔍</Text>
          <TextInput
            className="flex-1 py-3 text-sm text-neutral-900"
            placeholder="Search dispensaries..."
            placeholderTextColor="#a3a3a3"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <LoadingSpinner message="Finding dispensaries near you..." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DispensaryCard
              dispensary={item}
              onPress={() => router.push(`/dispensary/${item.id}`)}
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0f4c35" />
          }
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-4">🌿</Text>
              <Text className="text-base font-semibold text-neutral-700">
                {search ? 'No dispensaries found' : 'No dispensaries available'}
              </Text>
              <Text className="text-sm text-neutral-400 mt-1 text-center px-8">
                {search ? 'Try a different search term' : "Check back soon — we're growing."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
