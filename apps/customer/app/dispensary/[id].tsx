import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { InventoryService } from '@/services/inventory.service';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCartStore } from '@/store/cart.store';
import { Button } from '@/components/ui/Button';
import { ProductCategory } from '@/types';

const CATEGORIES: { key: ProductCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'flower', label: 'Flower 🌸' },
  { key: 'pre_roll', label: 'Pre-Roll 🌀' },
  { key: 'concentrate', label: 'Concentrate 💎' },
  { key: 'edible', label: 'Edibles 🍫' },
  { key: 'vape', label: 'Vape 💨' },
  { key: 'tincture', label: 'Tincture 💧' },
  { key: 'topical', label: 'Topical 🧴' },
];

export default function DispensaryMenuScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const itemCount = useCartStore((s) => s.itemCount);

  const { data: dispensary } = useQuery({
    queryKey: ['dispensary', id],
    queryFn: () => InventoryService.getDispensaryById(id),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', id, activeCategory],
    queryFn: () =>
      InventoryService.getProducts({
        dispensaryId: id,
        category: activeCategory === 'all' ? undefined : activeCategory,
        limit: 50,
      }),
  });

  const products = productsData?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      {/* Header */}
      <View className="bg-white px-5 pt-2 pb-3 border-b border-neutral-100">
        <Text className="text-xl font-bold text-neutral-900">{dispensary?.name ?? '…'}</Text>
        {dispensary && (
          <Text className="text-sm text-neutral-500 mt-0.5">
            {dispensary.city}, {dispensary.state} · {dispensary.isOpen ? '🟢 Open' : '🔴 Closed'}
          </Text>
        )}

        {/* Category pills */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingVertical: 10 }}
          style={{ marginHorizontal: -5 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveCategory(item.key)}
              className={[
                'mr-2 px-4 py-2 rounded-full border',
                activeCategory === item.key
                  ? 'bg-brand-900 border-brand-900'
                  : 'bg-white border-neutral-200',
              ].join(' ')}
              activeOpacity={0.7}
            >
              <Text
                className={[
                  'text-xs font-medium',
                  activeCategory === item.key ? 'text-white' : 'text-neutral-700',
                ].join(' ')}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Product grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading menu..." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 0 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ProductCard
                product={item}
                dispensaryId={id}
                onPress={() => router.push(`/product/${item.id}`)}
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-16 px-8">
              <Text className="text-4xl mb-3">🌿</Text>
              <Text className="text-base font-semibold text-neutral-700">No products found</Text>
            </View>
          }
        />
      )}

      {/* Cart CTA */}
      {itemCount > 0 && (
        <View className="absolute bottom-6 left-5 right-5">
          <Button
            label={`View Cart · ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            onPress={() => router.push('/(tabs)/cart')}
            fullWidth
            size="lg"
          />
        </View>
      )}
    </SafeAreaView>
  );
}
