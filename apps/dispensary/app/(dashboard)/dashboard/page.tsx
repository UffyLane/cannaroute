'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { orderApi } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { DispensaryStats, Order } from '@/types';

export default function DashboardPage() {
  const { data: stats } = useQuery<DispensaryStats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await orderApi.get('/orders/stats/today');
      return data;
    },
    refetchInterval: 30_000,
  });

  const { data: recentOrders = [] } = useQuery<Order[]>({
    queryKey: ['orders', 'recent'],
    queryFn: async () => {
      const { data } = await orderApi.get('/orders?limit=8&sort=createdAt:desc');
      return data;
    },
    refetchInterval: 20_000,
  });

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Orders Today"
          value={stats?.ordersToday ?? '—'}
          icon="📋"
          trend={{ value: 12, label: 'vs yesterday' }}
        />
        <StatCard
          label="Revenue Today"
          value={stats ? formatCurrency(stats.revenueToday) : '—'}
          icon="💰"
          trend={{ value: 8, label: 'vs yesterday' }}
          accentColor="bg-green-50 text-green-700"
        />
        <StatCard
          label="Active Drivers"
          value={stats?.activeDrivers ?? '—'}
          icon="🚗"
          accentColor="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Pending Orders"
          value={stats?.pendingOrders ?? '—'}
          icon="⏳"
          accentColor="bg-amber-50 text-amber-700"
        />
      </div>

      {/* Chart + recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Weekly revenue chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">Weekly Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.weeklyData ?? []} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }}
              />
              <Bar dataKey="revenue" fill="#0f4c35" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.slice(0, 6).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{order.customerName}</p>
                  <p className="text-xs text-neutral-400">{timeAgo(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">{formatCurrency(order.total)}</p>
                  <div className="mt-0.5">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
