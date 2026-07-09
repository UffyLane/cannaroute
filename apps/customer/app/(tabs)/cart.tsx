import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { CartItem } from '@/components/order/CartItem';
import { Button } from '@/components/ui/Button';

const DELIVERY_FEE = 5.99;
const TAX_RATE     = 0.1;

const BG      = '#060f08';
const SURFACE = 'rgba(255,255,255,0.05)';
const BORDER  = 'rgba(255,255,255,0.10)';
const GOLD    = '#f59e0b';
const WHITE   = '#ffffff';
const MUTED   = 'rgba(255,255,255,0.45)';

export default function CartScreen() {
  const { items, dispensaryId, subtotal } = useCart();
  const { user } = useAuth();

  const tax   = subtotal * TAX_RATE;
  const total = subtotal + DELIVERY_FEE + tax;

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <SafeAreaView style={[styles.safe, styles.emptyScreen]}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyBody}>
            Browse dispensaries and add products to get started
          </Text>
          <Button
            label="Discover Dispensaries"
            onPress={() => router.push('/(tabs)')}
            variant="gold"
            style={{ marginTop: 28 }}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Items */}
          <View style={styles.itemsCard}>
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </View>

          {/* Order summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery fee</Text>
              <Text style={styles.summaryValue}>${DELIVERY_FEE.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (10%)</Text>
              <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Checkout CTA */}
        <View style={styles.footer}>
          <Button
            label={`Checkout · $${total.toFixed(2)}`}
            onPress={handleCheckout}
            variant="gold"
            fullWidth
            size="lg"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  safe: { flex: 1 },

  emptyScreen: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyCartIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: WHITE, textAlign: 'center' },
  emptyBody: {
    fontSize: 14, color: MUTED, marginTop: 10,
    textAlign: 'center', lineHeight: 20,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: '#080f0a',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: WHITE },

  scroll: { flex: 1, paddingHorizontal: 16 },

  itemsCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 16,
    overflow: 'hidden',
  },

  summaryCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 12,
    marginBottom: 28,
    padding: 16,
  },
  summaryTitle: { fontSize: 15, fontWeight: '600', color: WHITE, marginBottom: 14 },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 13, color: MUTED },
  summaryValue: { fontSize: 13, color: WHITE },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 14,
    marginTop: 4,
  },
  totalLabel:  { fontSize: 16, fontWeight: '700', color: WHITE },
  totalAmount: { fontSize: 16, fontWeight: '700', color: GOLD },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: '#080f0a',
  },
});
