import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { CartItem } from '@/components/order/CartItem';
import { Button } from '@/components/ui/Button';
import { OrderService } from '@/services/order.service';

const DELIVERY_FEE = 5.99;
const TAX_RATE = 0.1;

export default function CartScreen() {
  const { items, dispensaryId, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const tax = subtotal * TAX_RATE;
  const total = subtotal + DELIVERY_FEE + tax;

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: () =>
      OrderService.placeOrder({
        dispensaryId: dispensaryId!,
        items: OrderService.cartItemsToPayload(items),
        deliveryAddress: user?.email ?? '',
        isMedical: user?.isMedical,
      }),
    onSuccess: (order) => {
      clearCart();
      Toast.show({ type: 'success', text1: 'Order placed!', text2: 'Your order is being prepared.' });
      router.push(`/track/${order.id}`);
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Order failed', text2: 'Please try again.' });
    },
  });

  const handleCheckout = () => {
    Alert.alert(
      'Confirm Order',
      `Total: $${total.toFixed(2)}\n\nBy placing this order you confirm all items are for personal adult-use only.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Place Order', onPress: () => placeOrder() },
      ],
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center px-8">
        <Text className="text-5xl mb-4">🛒</Text>
        <Text className="text-xl font-bold text-neutral-900">Your cart is empty</Text>
        <Text className="text-sm text-neutral-500 mt-2 text-center">
          Browse dispensaries and add products to get started
        </Text>
        <Button
          label="Discover Dispensaries"
          onPress={() => router.push('/(tabs)')}
          style={{ marginTop: 24 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100">
        <Text className="text-2xl font-bold text-neutral-900">Your Cart</Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Items */}
        <View className="bg-white rounded-2xl mt-4 px-4">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </View>

        {/* Order summary */}
        <View className="bg-white rounded-2xl mt-3 p-4 mb-6">
          <Text className="text-base font-semibold text-neutral-900 mb-3">Order Summary</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-neutral-600">Subtotal</Text>
            <Text className="text-sm text-neutral-900">${subtotal.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-neutral-600">Delivery fee</Text>
            <Text className="text-sm text-neutral-900">${DELIVERY_FEE.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-neutral-600">Tax (10%)</Text>
            <Text className="text-sm text-neutral-900">${tax.toFixed(2)}</Text>
          </View>

          <View className="border-t border-neutral-100 pt-3 flex-row justify-between">
            <Text className="text-base font-bold text-neutral-900">Total</Text>
            <Text className="text-base font-bold text-neutral-900">${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout CTA */}
      <View className="px-5 py-4 bg-white border-t border-neutral-100">
        <Button
          label={isPending ? 'Placing Order…' : `Place Order · $${total.toFixed(2)}`}
          onPress={handleCheckout}
          isLoading={isPending}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
