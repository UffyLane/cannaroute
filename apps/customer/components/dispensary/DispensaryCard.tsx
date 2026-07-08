import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Dispensary } from '@/types';
import { Badge } from '@/components/ui/Badge';

const SURFACE = 'rgba(255,255,255,0.05)';
const BORDER  = 'rgba(255,255,255,0.10)';
const GOLD    = '#f59e0b';
const WHITE   = '#ffffff';
const MUTED   = 'rgba(255,255,255,0.50)';
const MUTED2  = 'rgba(255,255,255,0.32)';

interface DispensaryCardProps {
  dispensary: Dispensary;
  onPress: () => void;
}

export function DispensaryCard({ dispensary, onPress }: DispensaryCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      {/* Cover image */}
      <View style={styles.cover}>
        {dispensary.logoUrl ? (
          <Image
            source={{ uri: dispensary.logoUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverIcon}>🌿</Text>
          </View>
        )}
        <View style={styles.badgeWrap}>
          <Badge
            label={dispensary.isOpen ? 'Open' : 'Closed'}
            variant={dispensary.isOpen ? 'success' : 'error'}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name}>{dispensary.name}</Text>
        <Text style={styles.location}>{dispensary.city}, {dispensary.state}</Text>

        <View style={styles.metaRow}>
          {/* Rating */}
          <View style={styles.ratingWrap}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.rating}>{dispensary.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({dispensary.reviewCount})</Text>
          </View>

          {dispensary.distanceMiles !== undefined && (
            <>
              <Text style={styles.sep}>·</Text>
              <Text style={styles.meta}>{dispensary.distanceMiles.toFixed(1)} mi</Text>
            </>
          )}

          {dispensary.deliveryAvailable && (
            <>
              <Text style={styles.sep}>·</Text>
              <Text style={styles.meta}>~{dispensary.estimatedDeliveryMinutes} min</Text>
            </>
          )}
        </View>

        {dispensary.deliveryAvailable && (
          <View style={styles.feeRow}>
            <Text style={styles.fee}>${dispensary.deliveryFee.toFixed(2)} delivery</Text>
            <Text style={styles.feeSep}>•</Text>
            <Text style={styles.fee}>${dispensary.minOrderAmount} min order</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cover: {
    height: 148,
    backgroundColor: 'rgba(15,76,53,0.28)',
  },
  coverPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  coverIcon: { fontSize: 40 },
  badgeWrap: { position: 'absolute', top: 12, right: 12 },

  content: { padding: 14 },
  name:     { fontSize: 16, fontWeight: '700', color: WHITE },
  location: { fontSize: 13, color: MUTED, marginTop: 3 },

  metaRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6, flexWrap: 'wrap' },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  star:    { color: GOLD, fontSize: 14 },
  rating:  { fontSize: 13, fontWeight: '600', color: WHITE },
  reviews: { fontSize: 12, color: MUTED },
  sep:     { color: MUTED, fontSize: 12 },
  meta:    { fontSize: 13, color: MUTED },

  feeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  fee:    { fontSize: 12, color: MUTED2 },
  feeSep: { color: MUTED2, fontSize: 11 },
});
