import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/cart.store';

const SURFACE = 'rgba(255,255,255,0.05)';
const BORDER  = 'rgba(255,255,255,0.10)';
const GREEN   = '#0f4c35';
const GOLD    = '#f59e0b';
const WHITE   = '#ffffff';
const MUTED   = 'rgba(255,255,255,0.45)';

const categoryLabel: Record<string, string> = {
  flower:      'Flower',
  concentrate: 'Concentrate',
  edible:      'Edible',
  tincture:    'Tincture',
  topical:     'Topical',
  vape:        'Vape',
  pre_roll:    'Pre-Roll',
  accessory:   'Accessory',
};

interface ProductCardProps {
  product: Product;
  dispensaryId: string;
  onPress: () => void;
}

export function ProductCard({ product, dispensaryId, onPress }: ProductCardProps) {
  const addItem      = useCartStore((s) => s.addItem);
  const items        = useCartStore((s) => s.items);
  const cartQuantity = items.find((i) => i.product.id === product.id)?.quantity ?? 0;

  const handleAddToCart = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    addItem(product, dispensaryId);
  };

  const inCart = cartQuantity > 0;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      {/* Image */}
      <View style={styles.imageWrap}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.imagePlaceholder}>🌱</Text>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameWrap}>
            <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
            {product.strain && <Text style={styles.strain}>{product.strain}</Text>}
          </View>
          <Badge label={categoryLabel[product.category] ?? product.category} variant="brand" />
        </View>

        {/* Cannabinoids */}
        {(product.thcPercentage !== undefined || product.cbdPercentage !== undefined) && (
          <View style={styles.cbdRow}>
            {product.thcPercentage !== undefined && (
              <Text style={styles.cbd}>THC {product.thcPercentage.toFixed(1)}%</Text>
            )}
            {product.cbdPercentage !== undefined && (
              <Text style={styles.cbd}>CBD {product.cbdPercentage.toFixed(1)}%</Text>
            )}
          </View>
        )}

        {/* Price + Add */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>${product.pricePerUnit.toFixed(2)}</Text>
            <Text style={styles.weight}>{product.weightGrams}g</Text>
          </View>

          <TouchableOpacity
            onPress={handleAddToCart}
            style={[styles.addBtn, inCart && styles.addBtnActive]}
            activeOpacity={0.8}
          >
            {inCart && (
              <Text style={[styles.addLabel, inCart && { color: '#0a1a0f' }]}>{cartQuantity}</Text>
            )}
            <Text style={[styles.addLabel, inCart && { color: '#0a1a0f' }]}>
              {inCart ? '+ Add' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Grower */}
        {product.grower && (
          <View style={styles.growerRow}>
            <Text style={styles.growerName}>🌿 {product.grower.farmName}</Text>
            {product.grower.noPesticidesUsed && (
              <Text style={styles.noPesticide}>• No Pesticides</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageWrap: {
    height: 120,
    backgroundColor: 'rgba(15,76,53,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image:            { width: '100%', height: '100%' },
  imagePlaceholder: { fontSize: 36 },

  content: { padding: 12 },
  topRow:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  nameWrap: { flex: 1, marginRight: 8 },
  name:   { fontSize: 14, fontWeight: '600', color: WHITE },
  strain: { fontSize: 12, color: MUTED, marginTop: 2 },

  cbdRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cbd:    { fontSize: 11, color: 'rgba(255,255,255,0.48)' },

  priceRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 10,
  },
  price:  { fontSize: 16, fontWeight: '700', color: WHITE },
  weight: { fontSize: 11, color: MUTED },

  addBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnActive: { backgroundColor: GOLD },
  addLabel: { color: WHITE, fontSize: 13, fontWeight: '600' },

  growerRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  growerName:   { fontSize: 11, color: 'rgba(110,231,183,0.75)' },
  noPesticide:  { fontSize: 11, color: 'rgba(34,197,94,0.75)' },
});
