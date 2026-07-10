'use client';
// v4
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
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Orders Today"
          value={stats?.ordersToday ?? '—'}
          icon="📋"
          trend={{ value: 12, label: 'vs yesterday' }}
          accentColor="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="Revenue Today"
          value={stats ? formatCurrency(stats.revenueToday) : '—'}
          icon="💰"
          trend={{ value: 8, label: 'vs yesterday' }}
          accentColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Active Drivers"
          value={stats?.activeDrivers ?? '—'}
          icon="🚗"
          accentColor="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Pending Orders"
          value={stats?.pendingOrders ?? '—'}
          icon="⏳"
          accentColor="bg-orange-50 text-orange-600"
        />
      </div>

      {/* ── Chart + recent orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Weekly revenue chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Weekly Revenue</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Last 7 days</p>
            </div>
          </div>
          <div className="px-2 pb-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={stats?.weeklyData ?? []}
                barSize={22}
                margin={{ left: 0, right: 4, top: 4, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#a3a3a3' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#a3a3a3' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={48}
                />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e5e5',
                    fontSize: 12,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                  cursor={{ fill: 'rgba(15,76,53,0.04)' }}
                />
                <Bar dataKey="revenue" fill="#0f4c35" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-sm font-bold text-neutral-900">Recent Orders</h2>
            <span className="text-xs text-neutral-400">{recentOrders.length} orders</span>
          </div>
          <div className="px-5 pb-5">
            <div className="divide-y divide-neutral-50">
              {recentOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">{timeAgo(order.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-neutral-900">{formatCurrency(order.total)}</p>
                    <div className="mt-1">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-10">No recent orders</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
