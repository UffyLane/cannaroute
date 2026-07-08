import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { DeliveryService } from '@/services/delivery.service';
import { Delivery } from '@/types';

const BG      = '#060f08';
const SURFACE = 'rgba(255,255,255,0.05)';
const BORDER  = 'rgba(255,255,255,0.10)';
const GOLD    = '#f59e0b';
const WHITE   = '#ffffff';
const MUTED   = 'rgba(255,255,255,0.45)';

export default function DeliveryHistoryScreen() {
  const { data: deliveries = [], isLoading, refetch, isRefetching } = useQuery<Delivery[]>({
    queryKey: ['deliveries', 'all'],
    queryFn: DeliveryService.getMyDeliveries,
  });

  const completed = deliveries.filter((d) => d.status === 'delivered' || d.status === 'failed');

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Delivery History</Text>
          <Text style={styles.headerSub}>{completed.length} completed</Text>
        </View>

        <FlatList
          data={completed}
          keyExtractor={(item: Delivery) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={GOLD} />
          }
          renderItem={({ item }: { item: Delivery }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.dispensaryName}>{item.dispensaryName}</Text>
                <View
                  style={[
                    styles.badge,
                    item.status === 'delivered' ? styles.badgeDelivered : styles.badgeFailed,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      item.status === 'delivered' ? styles.badgeTextDelivered : styles.badgeTextFailed,
                    ]}
                  >
                    {item.status === 'delivered' ? 'Delivered' : 'Failed'}
                  </Text>
                </View>
              </View>
              <Text style={styles.stopCount}>
                {item.stops.length} stop{item.stops.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            isLoading ? null : (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>No history yet</Text>
                <Text style={styles.emptyBody}>Completed deliveries will appear here</Text>
              </View>
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  safe: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
    backgroundColor: '#080f0a',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: WHITE },
  headerSub:   { fontSize: 13, color: MUTED, marginTop: 4 },

  listContent: { padding: 16, paddingBottom: 32 },

  card: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dispensaryName: { fontSize: 14, fontWeight: '600', color: WHITE, flex: 1, marginRight: 12 },
  stopCount:      { fontSize: 12, color: MUTED },

  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeDelivered: { backgroundColor: 'rgba(34,197,94,0.15)' },
  badgeFailed:    { backgroundColor: 'rgba(239,68,68,0.15)' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextDelivered: { color: '#4ade80' },
  badgeTextFailed:    { color: '#f87171' },

  empty:      { alignItems: 'center', paddingVertical: 80 },
  emptyIcon:  { fontSize: 44, marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: WHITE },
  emptyBody:  { fontSize: 13, color: MUTED, marginTop: 6 },
});
