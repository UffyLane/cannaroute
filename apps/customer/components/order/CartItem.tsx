import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/store/cart.store';

const BORDER = 'rgba(255,255,255,0.10)';
const GREEN  = '#0f4c35';
const WHITE  = '#ffffff';
const MUTED  = 'rgba(255,255,255,0.45)';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem     = useCartStore((s) => s.removeItem);

  return (
    <View style={styles.row}>
      {/* Product info */}
      <View style={styles.info}>
        <Text style={styles.name}>{item.product.name}</Text>
        <Text style={styles.sub}>
          ${item.product.pricePerUnit.toFixed(2)} · {item.product.weightGrams}g
        </Text>
      </View>

      {/* Quantity controls */}
      <View style={styles.qtyRow}>
        <TouchableOpacity
          onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
          style={styles.qtyBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.qtySign}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
          style={[styles.qtyBtn, styles.qtyBtnAdd]}
          activeOpacity={0.7}
        >
          <Text style={[styles.qtySign, { color: WHITE }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Line total */}
      <View style={styles.total}>
        <Text style={styles.totalText}>
          ${(item.product.pricePerUnit * item.quantity).toFixed(2)}
        </Text>
        <TouchableOpacity onPress={() => removeItem(item.product.id)} style={{ marginTop: 4 }}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: WHITE },
  sub:  { fontSize: 12, color: MUTED, marginTop: 3 },

  qtyRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnAdd: { backgroundColor: GREEN, borderColor: GREEN },
  qtySign: { fontSize: 16, color: WHITE, lineHeight: 18 },
  qty: { fontSize: 14, fontWeight: '600', color: WHITE, width: 28, textAlign: 'center' },

  total: { alignItems: 'flex-end', minWidth: 60 },
  totalText:  { fontSize: 14, fontWeight: '600', color: WHITE },
  removeText: { fontSize: 12, color: '#f87171' },
});
