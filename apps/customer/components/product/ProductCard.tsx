import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/cart.store';

interface ProductCardProps {
  product: Product;
  dispensaryId: string;
  onPress: () => void;
}

const categoryLabel: Record<string, string> = {
  flower: 'Flower',
  concentrate: 'Concentrate',
  edible: 'Edible',
  tincture: 'Tincture',
  topical: 'Topical',
  vape: 'Vape',
  pre_roll: 'Pre-Roll',
  accessory: 'Accessory',
};

export function ProductCard({ product, dispensaryId, onPress }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const cartQuantity = items.find((i) => i.product.id === product.id)?.quantity ?? 0;

  const handleAddToCart = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    addItem(product, dispensaryId);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-white rounded-2xl overflow-hidden mb-3 border border-neutral-100"
      style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } }}
    >
      {/* Product image */}
      <View className="h-28 bg-neutral-100 items-center justify-center">
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Text className="text-3xl">🌱</Text>
        )}
      </View>

      <View className="p-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
              {product.name}
            </Text>
            {product.strain && (
              <Text className="text-xs text-neutral-500 mt-0.5">{product.strain}</Text>
            )}
          </View>
          <Badge label={categoryLabel[product.category] ?? product.category} variant="brand" />
        </View>

        {/* THC / CBD */}
        {(product.thcPercentage !== undefined || product.cbdPercentage !== undefined) && (
          <View className="flex-row gap-x-3 mt-2">
            {product.thcPercentage !== undefined && (
              <Text className="text-xs text-neutral-600">
                THC {product.thcPercentage.toFixed(1)}%
              </Text>
            )}
            {product.cbdPercentage !== undefined && (
              <Text className="text-xs text-neutral-600">
                CBD {product.cbdPercentage.toFixed(1)}%
              </Text>
            )}
          </View>
        )}

        {/* Price + add to cart */}
        <View className="flex-row items-center justify-between mt-3">
          <View>
            <Text className="text-base font-bold text-neutral-900">
              ${product.pricePerUnit.toFixed(2)}
            </Text>
            <Text className="text-xs text-neutral-400">{product.weightGrams}g</Text>
          </View>

          <TouchableOpacity
            onPress={handleAddToCart}
            className="bg-brand-900 rounded-xl px-3 py-2 flex-row items-center"
            activeOpacity={0.8}
          >
            {cartQuantity > 0 && (
              <Text className="text-white text-sm font-bold mr-1">{cartQuantity}</Text>
            )}
            <Text className="text-white text-sm font-semibold">
              {cartQuantity > 0 ? '+ Add' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Grower badge */}
        {product.grower && (
          <View className="mt-2 flex-row items-center">
            <Text className="text-xs text-brand-700">🌿 {product.grower.farmName}</Text>
            {product.grower.noPesticidesUsed && (
              <Text className="text-xs text-green-600 ml-2">• No Pesticides</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
