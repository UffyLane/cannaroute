'use client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { authApi, orderApi } from '@/lib/api';
import { PlatformStats } from '@/types';
import { formatCurrency } from '@/lib/utils';

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-neutral-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-neutral-900 mt-1">{value}</p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl">{icon}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats } = useQuery<PlatformStats>({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const { data } = await authApi.get('/admin/stats');
      return data;
    },
  });

  const { data: orderTrend = [] } = useQuery({
    queryKey: ['order-trend'],
    queryFn: async () => {
      const { data } = await orderApi.get('/orders/stats/weekly');
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Platform Overview</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers.toLocaleString() ?? '—'} icon="👥" />
        <StatCard label="Total Orders" value={stats?.totalOrders.toLocaleString() ?? '—'} icon="📋" />
        <StatCard label="Total Revenue" value={stats ? formatCurrency(stats.totalRevenue) : '—'} icon="💰" />
        <StatCard label="Active Dispensaries" value={stats?.activeDispensaries ?? '—'} icon="🏪" />
        <StatCard label="Active Drivers" value={stats?.activeDrivers ?? '—'} icon="🚗" />
        <StatCard label="Active Growers" value={stats?.activeGrowers ?? '—'} icon="🌱" />
      </div>

      {/* Order trend chart */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-neutral-700 mb-4">Order Volume (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={orderTrend} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
            <Bar dataKey="orders" fill="#0f4c35" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
