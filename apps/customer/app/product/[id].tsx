import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { InventoryService } from '@/services/inventory.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart.store';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => InventoryService.getProductById(id),
  });

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, product.dispensaryId);
    Toast.show({ type: 'success', text1: 'Added to cart', text2: product.name });
  };

  const labTest = product.latestLabTest;
  const grower = product.grower;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product image */}
        <View className="h-56 bg-neutral-100 items-center justify-center">
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="text-6xl">🌱</Text>
          )}
        </View>

        <View className="px-5 pt-5 pb-28">
          {/* Name + category */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-2xl font-bold text-neutral-900">{product.name}</Text>
              {product.strain && (
                <Text className="text-sm text-neutral-500 mt-1">{product.strain}</Text>
              )}
            </View>
            <Badge label={product.category.replace('_', ' ')} variant="brand" size="md" />
          </View>

          {/* Price */}
          <View className="flex-row items-end mt-3">
            <Text className="text-3xl font-bold text-neutral-900">
              ${product.pricePerUnit.toFixed(2)}
            </Text>
            <Text className="text-sm text-neutral-400 ml-2 mb-1">/ {product.weightGrams}g</Text>
          </View>

          {/* THC / CBD bars */}
          {(product.thcPercentage !== undefined || product.cbdPercentage !== undefined) && (
            <View className="bg-white rounded-2xl p-4 mt-4 border border-neutral-100">
              <Text className="text-sm font-semibold text-neutral-700 mb-3">Cannabinoids</Text>

              {product.thcPercentage !== undefined && (
                <View className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-neutral-600">THC</Text>
                    <Text className="text-xs font-semibold text-neutral-900">
                      {product.thcPercentage.toFixed(1)}%
                    </Text>
                  </View>
                  <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-brand-600 rounded-full"
                      style={{ width: `${Math.min(product.thcPercentage, 40) / 40 * 100}%` }}
                    />
                  </View>
                </View>
              )}

              {product.cbdPercentage !== undefined && (
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-neutral-600">CBD</Text>
                    <Text className="text-xs font-semibold text-neutral-900">
                      {product.cbdPercentage.toFixed(1)}%
                    </Text>
                  </View>
                  <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-accent-500 rounded-full"
                      style={{ width: `${Math.min(product.cbdPercentage, 30) / 30 * 100}%` }}
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View className="mt-4">
              <Text className="text-sm font-semibold text-neutral-700 mb-1">About</Text>
              <Text className="text-sm text-neutral-600 leading-6">{product.description}</Text>
            </View>
          )}

          {/* Grower transparency */}
          {grower && (
            <View className="bg-brand-50 border border-brand-200 rounded-2xl p-4 mt-4">
              <Text className="text-sm font-semibold text-brand-900 mb-2">🌿 Grower Info</Text>
              <Text className="text-sm font-medium text-neutral-900">{grower.farmName}</Text>
              <Text className="text-xs text-neutral-500 mt-0.5">
                {grower.city}, {grower.state}
              </Text>

              <View className="flex-row flex-wrap gap-2 mt-3">
                {grower.noPesticidesUsed && (
                  <Badge label="No Pesticides" variant="success" />
                )}
                {grower.outdoorGrown && <Badge label="Outdoor Grown" variant="brand" />}
                {grower.indoorGrown && <Badge label="Indoor Grown" variant="brand" />}
                {grower.cleanGreenCertified && <Badge label="Clean Green" variant="success" />}
                {grower.usdaOrganic && <Badge label="USDA Organic" variant="success" />}
              </View>
            </View>
          )}

          {/* Lab test */}
          {labTest && (
            <View className="bg-white border border-neutral-100 rounded-2xl p-4 mt-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-neutral-700">Lab Test</Text>
                <Badge
                  label={labTest.overallPass ? 'Pass' : 'Fail'}
                  variant={labTest.overallPass ? 'success' : 'error'}
                />
              </View>
              <Text className="text-xs text-neutral-400">
                {labTest.labName} · Tested {new Date(labTest.testedAt).toLocaleDateString()}
              </Text>
              {labTest.coaUrl && (
                <TouchableOpacity className="mt-2">
                  <Text className="text-xs text-brand-700 font-medium">View Full COA →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to cart CTA */}
      <View className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-neutral-100">
        <Button label="Add to Cart" onPress={handleAddToCart} fullWidth size="lg" />
      </View>
    </SafeAreaView>
  );
}
