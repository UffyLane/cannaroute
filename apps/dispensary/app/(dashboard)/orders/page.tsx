'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { orderApi } from '@/lib/api';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { Order, OrderStatus } from '@/types';

const STATUS_FILTERS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all',            label: 'All' },
  { key: 'pending',        label: 'Pending' },
  { key: 'confirmed',      label: 'Confirmed' },
  { key: 'preparing',      label: 'Preparing' },
  { key: 'in_transit',     label: 'In Transit' },
  { key: 'delivered',      label: 'Delivered' },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:          'confirmed',
  confirmed:        'preparing',
  preparing:        'ready_for_pickup',
  ready_for_pickup: 'in_transit',
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders', filter],
    queryFn: async () => {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await orderApi.get(`/orders${params}`);
      return data;
    },
    refetchInterval: 15_000,
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderApi.patch(`/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  return (
    <div className="space-y-4">
      {/* ── Filter tabs ── */}
      <div className="flex gap-2 flex-wrap items-center">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all border"
            style={
              filter === f.key
                ? { backgroundColor: '#0f4c35', color: '#ffffff', borderColor: '#0f4c35' }
                : { backgroundColor: '#ffffff', color: '#737373', borderColor: '#e5e5e5' }
            }
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-neutral-400">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2"
              style={{ borderColor: 'rgba(15,76,53,0.20)', borderTopColor: '#0f4c35' }}
            />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <span className="text-3xl">📭</span>
            <p className="text-sm text-neutral-400">No orders found</p>
          </div>
        ) : (
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const nextStatus = NEXT_STATUS[order.status];
                return (
                  <tr key={order.id}>
                    <td className="font-mono text-xs text-neutral-400">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td>
                      <p className="font-semibold text-neutral-900">{order.customerName}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{order.customerEmail}</p>
                    </td>
                    <td className="text-neutral-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="font-bold text-neutral-900">{formatCurrency(order.total)}</td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="text-neutral-400 text-xs">{timeAgo(order.createdAt)}</td>
                    <td>
                      {nextStatus ? (
                        <Button
                          size="sm"
                          variant="outline"
                          isLoading={isPending}
                          onClick={() => updateStatus({ orderId: order.id, status: nextStatus })}
                        >
                          → {nextStatus.replace(/_/g, ' ')}
                        </Button>
                      ) : (
                        <span className="text-xs text-neutral-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
