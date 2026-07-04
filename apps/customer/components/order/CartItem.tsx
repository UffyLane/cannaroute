import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/store/cart.store';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <View className="flex-row items-center py-4 border-b border-neutral-100">
      {/* Product info */}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-neutral-900">{item.product.name}</Text>
        <Text className="text-xs text-neutral-500 mt-0.5">
          ${item.product.pricePerUnit.toFixed(2)} · {item.product.weightGrams}g
        </Text>
      </View>

      {/* Quantity controls */}
      <View className="flex-row items-center mx-4">
        <TouchableOpacity
          onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
          className="w-8 h-8 rounded-full border border-neutral-300 items-center justify-center"
          activeOpacity={0.7}
        >
          <Text className="text-base text-neutral-700 font-medium">−</Text>
        </TouchableOpacity>

        <Text className="text-sm font-semibold text-neutral-900 w-8 text-center">
          {item.quantity}
        </Text>

        <TouchableOpacity
          onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
          className="w-8 h-8 rounded-full bg-brand-900 items-center justify-center"
          activeOpacity={0.7}
        >
          <Text className="text-base text-white font-medium">+</Text>
        </TouchableOpacity>
      </View>

      {/* Line total */}
      <View className="items-end min-w-[60px]">
        <Text className="text-sm font-semibold text-neutral-900">
          ${(item.product.pricePerUnit * item.quantity).toFixed(2)}
        </Text>
        <TouchableOpacity onPress={() => removeItem(item.product.id)} className="mt-1">
          <Text className="text-xs text-red-400">Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
