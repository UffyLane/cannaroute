'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { AdminUser } from '@/types';
import { timeAgo } from '@/lib/utils';

const roleStyle: Record<string, { bg: string; color: string }> = {
  admin:            { bg: 'rgba(147,51,234,0.10)', color: '#7e22ce' },
  dispensary_staff: { bg: 'rgba(59,130,246,0.10)',  color: '#1d4ed8' },
  driver:           { bg: 'rgba(245,158,11,0.10)',  color: '#92400e' },
  grower:           { bg: 'rgba(34,197,94,0.10)',   color: '#166534' },
  customer:         { bg: 'rgba(0,0,0,0.05)',        color: '#525252' },
};

const roles = ['all', 'admin', 'dispensary_staff', 'driver', 'grower', 'customer'];

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users', roleFilter],
    queryFn: async () => {
      const params = roleFilter !== 'all' ? `?role=${roleFilter}` : '';
      const { data } = await authApi.get(`/admin/users${params}`);
      return data;
    },
  });

  const { mutate: toggleVerified } = useMutation({
    mutationFn: (user: AdminUser) =>
      authApi.patch(`/admin/users/${user.id}`, { isVerified: !user.isVerified }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated');
    },
  });

  const filtered = users.filter((u) =>
    search
      ? `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  return (
    <div className="space-y-4">
      {/* ── Search + filters ── */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all capitalize"
              style={
                roleFilter === r
                  ? { backgroundColor: '#0f4c35', color: '#ffffff', borderColor: '#0f4c35' }
                  : { backgroundColor: '#ffffff', color: '#737373', borderColor: '#e5e5e5' }
              }
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        <span className="ml-auto text-sm text-neutral-400 shrink-0">
          {filtered.length} user{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2"
              style={{ borderColor: 'rgba(15,76,53,0.20)', borderTopColor: '#0f4c35' }}
            />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Name</th>
                <th className="th">Email</th>
                <th className="th">Role</th>
                <th className="th">Verified</th>
                <th className="th">Joined</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const rs = roleStyle[user.role] ?? roleStyle.customer;
                return (
                  <tr key={user.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: rs.color }}
                        >
                          {user.firstName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <p className="font-semibold text-neutral-900">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="td text-neutral-500">{user.email}</td>
                    <td className="td">
                      <span
                        className="badge capitalize"
                        style={{ backgroundColor: rs.bg, color: rs.color }}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="td">
                      <span
                        className="badge"
                        style={
                          user.isVerified
                            ? { backgroundColor: 'rgba(34,197,94,0.10)', color: '#166534' }
                            : { backgroundColor: 'rgba(245,158,11,0.10)', color: '#92400e' }
                        }
                      >
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="td text-neutral-400 text-xs">{timeAgo(user.createdAt)}</td>
                    <td className="td">
                      <button
                        onClick={() => toggleVerified(user)}
                        className="text-xs font-semibold transition-colors"
                        style={{ color: user.isVerified ? '#dc2626' : '#0f4c35' }}
                      >
                        {user.isVerified ? 'Revoke' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="td text-center text-neutral-400 py-12">
                    {search ? `No users matching "${search}"` : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
