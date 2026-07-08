'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { authApi, orderApi } from '@/lib/api';
import { PlatformStats } from '@/types';
import { formatCurrency } from '@/lib/utils';

// ── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  accentColor?: string;
}

function StatCard({ label, value, icon, accentColor = 'bg-emerald-50 text-emerald-700' }: StatCardProps) {
  return (
    <div className="card p-5 flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-neutral-900 mt-2 tabular-nums">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ml-4 ${accentColor}`}>
        {icon}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data: stats } = useQuery<PlatformStats>({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const { data } = await authApi.get('/admin/stats');
      return data;
    },
    refetchInterval: 60_000,
  });

  const { data: orderTrend = [] } = useQuery({
    queryKey: ['order-trend'],
    queryFn: async () => {
      const { data } = await orderApi.get('/orders/stats/weekly');
      return data;
    },
    refetchInterval: 60_000,
  });

  return (
    <div className="space-y-6">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers.toLocaleString() ?? '—'}
          icon="👥"
          accentColor="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders.toLocaleString() ?? '—'}
          icon="📋"
          accentColor="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Total Revenue"
          value={stats ? formatCurrency(stats.totalRevenue) : '—'}
          icon="💰"
          accentColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Active Dispensaries"
          value={stats?.activeDispensaries ?? '—'}
          icon="🏪"
          accentColor="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="Active Drivers"
          value={stats?.activeDrivers ?? '—'}
          icon="🚗"
          accentColor="bg-sky-50 text-sky-600"
        />
        <StatCard
          label="Active Growers"
          value={stats?.activeGrowers ?? '—'}
          icon="🌱"
          accentColor="bg-green-50 text-green-700"
        />
      </div>

      {/* ── Order volume chart ── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Order Volume</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Last 30 days</p>
          </div>
        </div>
        <div className="px-2 pb-5">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={orderTrend}
              barSize={16}
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
                width={36}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e5e5e5',
                  fontSize: 12,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
                cursor={{ fill: 'rgba(15,76,53,0.04)' }}
              />
              <Bar dataKey="orders" fill="#0f4c35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
