import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/services/order.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Order, OrderStatus } from '@/types';

const BG      = '#060f08';
const SURFACE = 'rgba(255,255,255,0.05)';
const BORDER  = 'rgba(255,255,255,0.10)';
const GOLD    = '#f59e0b';
const WHITE   = '#ffffff';
const MUTED   = 'rgba(255,255,255,0.45)';

const statusBadgeVariant: Record<OrderStatus, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  pending:          'warning',
  confirmed:        'info',
  preparing:        'info',
  ready_for_pickup: 'info',
  in_transit:       'brand' as never,
  delivered:        'success',
  cancelled:        'error',
};

const statusLabel: Record<OrderStatus, string> = {
  pending:          'Pending',
  confirmed:        'Confirmed',
  preparing:        'Preparing',
  ready_for_pickup: 'Ready',
  in_transit:       'On the Way',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

export default function OrdersScreen() {
  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders'],
    queryFn: OrderService.getOrders,
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Orders</Text>
        </View>

        {isLoading ? (
          <LoadingSpinner message="Loading orders..." />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item: Order) => item.id}
            renderItem={({ item }: { item: Order }) => (
              <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.8}
                onPress={() =>
                  item.status === 'in_transit' ? router.push(`/track/${item.id}`) : undefined
                }
              >
                <View style={styles.topRow}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.dispensaryName}>{item.dispensaryName}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Badge
                    label={statusLabel[item.status]}
                    variant={statusBadgeVariant[item.status]}
                  />
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.itemCount}>
                    {item.items.length} item{item.items.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
                </View>

                {item.status === 'in_transit' && (
                  <TouchableOpacity
                    style={styles.trackBtn}
                    onPress={() => router.push(`/track/${item.id}`)}
                  >
                    <Text style={styles.trackBtnText}>📍 Track Delivery</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={GOLD} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No orders yet</Text>
                <Text style={styles.emptyBody}>
                  Browse dispensaries and place your first order
                </Text>
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

  listContent: { paddingTop: 10, paddingBottom: 32 },

  orderCard: {
    backgroundColor: SURFACE,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  orderInfo: { flex: 1, marginRight: 12 },
  dispensaryName: { fontSize: 15, fontWeight: '600', color: WHITE },
  orderDate: { fontSize: 12, color: MUTED, marginTop: 4 },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  itemCount:  { fontSize: 13, color: MUTED },
  orderTotal: { fontSize: 16, fontWeight: '700', color: WHITE },

  trackBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.28)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  trackBtnText: { fontSize: 13, fontWeight: '600', color: GOLD },

  empty:      { alignItems: 'center', paddingVertical: 80 },
  emptyIcon:  { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: WHITE },
  emptyBody:  { fontSize: 13, color: MUTED, marginTop: 6, textAlign: 'center' },
});
