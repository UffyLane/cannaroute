'use client';

import { useState } from 'react';

type Status = 'active' | 'pending' | 'suspended';

interface Dispensary {
  id: string;
  name: string;
  license: string;
  city: string;
  state: string;
  status: Status;
  ordersToday: number;
  joined: string;
  contact: string;
}

const dispensaries: Dispensary[] = [
  { id: '1', name: 'Green Leaf Dispensary',   license: 'DR-0042', city: 'Detroit',       state: 'MI', status: 'active',    ordersToday: 14, joined: 'Jan 12, 2025', contact: 'dispensary@demo.canna-route.com' },
  { id: '2', name: 'Midwest Cannabis Co.',    license: 'DR-0091', city: 'Grand Rapids',  state: 'MI', status: 'active',    ordersToday: 9,  joined: 'Feb 3, 2025',  contact: 'ops@midwestcannabis.com' },
  { id: '3', name: 'Pure Michigan Provisioning', license: 'DR-0105', city: 'Lansing',    state: 'MI', status: 'active',    ordersToday: 6,  joined: 'Mar 18, 2025', contact: 'admin@puremichigan.com' },
  { id: '4', name: 'Northern Roots',          license: 'DR-0118', city: 'Traverse City', state: 'MI', status: 'pending',   ordersToday: 0,  joined: 'Jun 30, 2025', contact: 'info@northernroots.com' },
  { id: '5', name: 'Capitol City Canna',      license: 'DR-0077', city: 'Lansing',       state: 'MI', status: 'suspended', ordersToday: 0,  joined: 'Dec 1, 2024',  contact: 'contact@capitolcanna.com' },
];

function StatusBadge({ status }: { status: Status }) {
  const map = {
    active:    { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
    pending:   { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Pending' },
    suspended: { bg: 'bg-red-50',     text: 'text-red-700',     label: 'Suspended' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

export default function DispensariesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const filtered = dispensaries.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                        d.city.toLowerCase().includes(search.toLowerCase()) ||
                        d.license.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || d.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    active:    dispensaries.filter(d => d.status === 'active').length,
    pending:   dispensaries.filter(d => d.status === 'pending').length,
    suspended: dispensaries.filter(d => d.status === 'suspended').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Dispensaries</h1>
        <p className="text-sm text-neutral-500 mt-0.5">All registered dispensaries on the CannaRoute platform</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',    value: counts.active,    color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Pending',   value: counts.pending,   color: 'text-amber-700',   bg: 'bg-amber-50'   },
          { label: 'Suspended', value: counts.suspended, color: 'text-red-700',     bg: 'bg-red-50'     },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
              <span className={`text-xl font-bold ${color}`}>{value}</span>
            </div>
            <p className="text-sm font-semibold text-neutral-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, city, or license…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
        />
        <div className="flex gap-1">
          {(['all', 'active', 'pending', 'suspended'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filter === f ? 'text-white' : 'text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50'
              }`}
              style={filter === f ? { backgroundColor: '#0f4c35' } : {}}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-50">
              {['Dispensary', 'License', 'Location', 'Orders Today', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-neutral-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filtered.map(d => (
              <tr key={d.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-neutral-900">{d.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{d.contact}</p>
                </td>
                <td className="px-5 py-3.5 text-neutral-600 font-mono text-xs">{d.license}</td>
                <td className="px-5 py-3.5 text-neutral-600">{d.city}, {d.state}</td>
                <td className="px-5 py-3.5">
                  <span className={`font-semibold ${d.ordersToday > 0 ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    {d.ordersToday}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-neutral-500 text-xs">{d.joined}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-5 py-3.5">
                  <button className="text-xs font-semibold text-emerald-700 hover:underline">
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-neutral-400">
                  No dispensaries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
