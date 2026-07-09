import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { OrderService } from '@/services/order.service';
import { PaymentService } from '@/services/payment.service';

// ── Design tokens ─────────────────────────────────────────────────────────────

const BG      = '#060f08';
const SURFACE = 'rgba(255,255,255,0.05)';
const BORDER  = 'rgba(255,255,255,0.10)';
const GREEN   = '#0f4c35';
const GOLD    = '#f59e0b';
const WHITE   = '#ffffff';
const MUTED   = 'rgba(255,255,255,0.45)';
const TAB_BG  = '#080f0a';

const DELIVERY_FEE = 5.99;
const TAX_RATE     = 0.10;

// ── Payment methods ───────────────────────────────────────────────────────────

interface PaymentMethod {
  id: 'canpay' | 'point_of_banking' | 'cash';
  label: string;
  subtitle: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'canpay',
    label: 'CanPay',
    subtitle: 'Debit from your bank account — no fees',
    icon: '🏦',
    badge: 'Recommended',
    badgeColor: GOLD,
  },
  {
    id: 'point_of_banking',
    label: 'Point of Banking',
    subtitle: 'Cashless debit at pickup from dispensary',
    icon: '💳',
  },
  {
    id: 'cash',
    label: 'Cash on Delivery',
    subtitle: 'Pay driver in cash when your order arrives',
    icon: '💵',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CheckoutScreen() {
  const { items, dispensaryId, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod['id']>('canpay');

  const tax          = subtotal * TAX_RATE;
  const total        = subtotal + DELIVERY_FEE + tax;
  const totalCents   = Math.round(total * 100);

  // Step 1: place the order
  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: async () => {
      const order = await OrderService.placeOrder({
        dispensaryId:    dispensaryId!,
        items:           OrderService.cartItemsToPayload(items),
        deliveryAddress: user?.email ?? '',
        isMedical:       user?.isMedical,
        paymentMethod:   selectedMethod,
      });
      return order;
    },
    onSuccess: async (order) => {
      clearCart();

      // Step 2: initiate payment
      if (selectedMethod === 'canpay') {
        try {
          const payment = await PaymentService.initiate({
            order_id:       order.id,
            dispensary_id:  order.dispensary_id ?? dispensaryId!,
            amount_cents:   totalCents,
            payment_method: 'canpay',
            return_url:     'cannaroute://payment-complete',
          });

          // Open CanPay deep-link if provided
          if (payment.processor_redirect_url) {
            const canOpen = await Linking.canOpenURL(payment.processor_redirect_url);
            if (canOpen) {
              await Linking.openURL(payment.processor_redirect_url);
            } else {
              Toast.show({
                type: 'info',
                text1: 'CanPay app not installed',
                text2: 'Download CanPay to complete payment',
              });
            }
          }
        } catch {
          Toast.show({
            type: 'error',
            text1: 'Payment initiation failed',
            text2: 'Your order was placed — contact support to complete payment.',
          });
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Order placed!',
        text2: selectedMethod === 'cash'
          ? 'Pay the driver on delivery'
          : selectedMethod === 'point_of_banking'
          ? 'Pay at the dispensary via card'
          : 'Complete payment in CanPay',
      });
      router.replace(`/track/${order.id}`);
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Order failed', text2: 'Please try again.' });
    },
  });

  const handlePlaceOrder = () => {
    Alert.alert(
      'Confirm Order',
      `Total: $${total.toFixed(2)}\nPayment: ${PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}\n\nBy placing this order you confirm all items are for personal adult-use only.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Place Order', onPress: () => placeOrder() },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Payment method selection ── */}
          <Text style={styles.sectionLabel}>Payment Method</Text>
          <View style={styles.methodsCard}>
            {PAYMENT_METHODS.map((method, idx) => {
              const isSelected = selectedMethod === method.id;
              const isLast = idx === PAYMENT_METHODS.length - 1;

              return (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelectedMethod(method.id)}
                  style={[
                    styles.methodRow,
                    isSelected && styles.methodRowSelected,
                    !isLast && styles.methodRowBorder,
                  ]}
                  activeOpacity={0.7}
                >
                  {/* Icon */}
                  <View style={[styles.methodIcon, isSelected && styles.methodIconSelected]}>
                    <Text style={styles.methodIconText}>{method.icon}</Text>
                  </View>

                  {/* Labels */}
                  <View style={styles.methodInfo}>
                    <View style={styles.methodLabelRow}>
                      <Text style={[styles.methodLabel, isSelected && styles.methodLabelSelected]}>
                        {method.label}
                      </Text>
                      {method.badge && (
                        <View style={[styles.badge, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                          <Text style={[styles.badgeText, { color: GOLD }]}>{method.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                  </View>

                  {/* Radio */}
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── CanPay info box ── */}
          {selectedMethod === 'canpay' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>About CanPay</Text>
              <Text style={styles.infoBody}>
                CanPay is a cannabis-compliant digital debit solution. After placing your order, you'll be redirected to the CanPay app to authorize the payment directly from your bank account — no credit card required.
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://canpay.com')}>
                <Text style={styles.infoLink}>Learn more at canpay.com →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Order summary ── */}
          <Text style={styles.sectionLabel}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</Text>
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

          {/* ── Legal disclaimer ── */}
          <Text style={styles.disclaimer}>
            By placing this order, you confirm you are 21+ (or a valid medical patient) and that all products are for personal use only. CannaRoute collects a 10% platform fee. Cannabis sales are final — refunds subject to dispensary policy.
          </Text>
        </ScrollView>

        {/* ── CTA Footer ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isPending}
            style={[styles.ctaButton, isPending && styles.ctaButtonDisabled]}
            activeOpacity={0.85}
          >
            {isPending ? (
              <ActivityIndicator color={BG} />
            ) : (
              <Text style={styles.ctaText}>
                Place Order · ${total.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: TAB_BG,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: WHITE },
  headerTitle: { fontSize: 20, fontWeight: '700', color: WHITE },

  scroll: { flex: 1, paddingHorizontal: 16 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },

  // ── Payment methods ──
  methodsCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  methodRowSelected: {
    backgroundColor: 'rgba(15,76,53,0.12)',
  },
  methodRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconSelected: {
    backgroundColor: 'rgba(15,76,53,0.25)',
  },
  methodIconText: { fontSize: 22 },
  methodInfo: { flex: 1 },
  methodLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  methodLabel: { fontSize: 15, fontWeight: '600', color: MUTED },
  methodLabelSelected: { color: WHITE },
  methodSubtitle: { fontSize: 12, color: MUTED, lineHeight: 17 },

  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: GREEN,
    backgroundColor: 'rgba(15,76,53,0.15)',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: GREEN,
  },

  // ── Info box ──
  infoBox: {
    backgroundColor: 'rgba(15,76,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(15,76,53,0.25)',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  infoTitle: { fontSize: 12, fontWeight: '700', color: '#4ade80', marginBottom: 6 },
  infoBody: { fontSize: 12, color: MUTED, lineHeight: 18 },
  infoLink: { fontSize: 12, color: '#4ade80', marginTop: 8, fontWeight: '600' },

  // ── Order summary ──
  summaryCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
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

  // ── Disclaimer ──
  disclaimer: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.28)',
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 8,
  },

  // ── Footer CTA ──
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: TAB_BG,
  },
  ctaButton: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonDisabled: { opacity: 0.55 },
  ctaText: { color: '#1a0f00', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
