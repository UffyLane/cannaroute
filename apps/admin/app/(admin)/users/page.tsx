'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { AdminUser } from '@/types';
import { timeAgo } from '@/lib/utils';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  dispensary_staff: 'bg-blue-100 text-blue-700',
  driver: 'bg-amber-100 text-amber-700',
  grower: 'bg-green-100 text-green-700',
  customer: 'bg-neutral-100 text-neutral-700',
};

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User updated'); },
  });

  const filtered = users.filter((u) =>
    search ? `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const roles = ['all', 'admin', 'dispensary_staff', 'driver', 'grower', 'customer'];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-neutral-900">Users</h1>

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 flex-1 min-w-[200px]"
        />
        <div className="flex gap-2 flex-wrap">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors capitalize ${
                roleFilter === r ? 'bg-brand-900 text-white border-brand-900' : 'bg-white text-neutral-600 border-neutral-200'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
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
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="td font-medium">{user.firstName} {user.lastName}</td>
                  <td className="td text-neutral-500">{user.email}</td>
                  <td className="td">
                    <span className={`badge capitalize ${ROLE_COLORS[user.role] ?? 'bg-neutral-100 text-neutral-700'}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="td">
                    <span className={`badge ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="td text-neutral-400 text-xs">{timeAgo(user.createdAt)}</td>
                  <td className="td">
                    <button
                      onClick={() => toggleVerified(user)}
                      className="text-xs text-brand-700 hover:underline font-medium"
                    >
                      {user.isVerified ? 'Revoke' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="td text-center text-neutral-400 py-12">No users found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
