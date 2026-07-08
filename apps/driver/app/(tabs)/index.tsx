import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { DeliveryService } from '@/services/delivery.service';
import { Delivery } from '@/types';

const BG      = '#060f08';
const SURFACE = 'rgba(255,255,255,0.05)';
const BORDER  = 'rgba(255,255,255,0.10)';
const GREEN   = '#0f4c35';
const GOLD    = '#f59e0b';
const WHITE   = '#ffffff';
const MUTED   = 'rgba(255,255,255,0.45)';

const ACTIVE_STATUSES = ['assigned', 'en_route_to_dispensary', 'picked_up', 'en_route_to_customer'];

function StatusPill({ status }: { status: string }) {
  const isActive = ACTIVE_STATUSES.includes(status);
  return (
    <View style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}>
      <Text style={[styles.pillText, isActive ? styles.pillTextActive : styles.pillTextInactive]}>
        {status.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}

export default function DeliveryQueueScreen() {
  const { data: deliveries = [], isLoading, refetch, isRefetching } = useQuery<Delivery[]>({
    queryKey: ['deliveries', 'active'],
    queryFn: DeliveryService.getMyDeliveries,
    refetchInterval: 20_000,
  });

  const active = deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'failed');

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Delivery Queue</Text>
          <Text style={styles.headerSub}>
            {active.length} active assignment{active.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingIcon}>🚗</Text>
            <Text style={styles.loadingText}>Loading deliveries...</Text>
          </View>
        ) : (
          <FlatList
            data={active}
            keyExtractor={(item: Delivery) => item.id}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={GOLD} />
            }
            contentContainerStyle={styles.listContent}
            renderItem={({ item }: { item: Delivery }) => (
              <TouchableOpacity
                style={styles.deliveryCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/delivery/${item.id}`)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.dispensaryName}>📍 {item.dispensaryName}</Text>
                    <Text style={styles.dispensaryAddress}>{item.dispensaryAddress}</Text>
                  </View>
                  <StatusPill status={item.status} />
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.stopCount}>
                    {item.stops.length} stop{item.stops.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.viewLink}>View →</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptyBody}>No deliveries assigned right now</Text>
              </View>
            }
          />
        )}
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
    borderBottomColor: BORDER,
    backgroundColor: '#080f0a',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: WHITE },
  headerSub:   { fontSize: 13, color: MUTED, marginTop: 4 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingIcon: { fontSize: 40, marginBottom: 12 },
  loadingText: { fontSize: 14, color: MUTED },

  listContent: { padding: 16, paddingBottom: 32 },

  deliveryCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardInfo: { flex: 1, marginRight: 12 },
  dispensaryName:    { fontSize: 15, fontWeight: '600', color: WHITE },
  dispensaryAddress: { fontSize: 12, color: MUTED, marginTop: 4 },

  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 12,
  },
  stopCount: { fontSize: 13, color: MUTED },
  viewLink:  { fontSize: 14, fontWeight: '700', color: GOLD },

  pill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  pillActive:   { backgroundColor: 'rgba(34,197,94,0.15)' },
  pillInactive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  pillText:      { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  pillTextActive:   { color: '#4ade80' },
  pillTextInactive: { color: MUTED },

  empty:      { alignItems: 'center', paddingVertical: 80 },
  emptyIcon:  { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: WHITE },
  emptyBody:  { fontSize: 13, color: MUTED, marginTop: 6 },
});
