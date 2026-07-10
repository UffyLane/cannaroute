'use client';

import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function StatusBadge({ status }: { status: 'compliant' | 'warning' | 'violation' }) {
  const map = {
    compliant: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Compliant' },
    warning:   { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Warning' },
    violation: { bg: 'bg-red-50',     text: 'text-red-700',     label: 'Violation' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

const complianceItems = [
  { id: 1, category: 'License',        item: 'Retail Dispensary License',       status: 'compliant' as const, expiry: '2025-12-31', note: 'Michigan CRA License #DR-0042' },
  { id: 2, category: 'License',        item: 'State Operating Permit',           status: 'compliant' as const, expiry: '2025-06-30', note: 'Annual renewal required' },
  { id: 3, category: 'Inventory',      item: 'METRC Seed-to-Sale Tracking',      status: 'compliant' as const, expiry: null,         note: 'Last sync: today at 2:14 AM' },
  { id: 4, category: 'Inventory',      item: 'Daily Inventory Reconciliation',   status: 'compliant' as const, expiry: null,         note: 'No discrepancies found' },
  { id: 5, category: 'Delivery',       item: 'Driver Background Checks',         status: 'compliant' as const, expiry: null,         note: '3 active drivers — all verified' },
  { id: 6, category: 'Delivery',       item: 'Vehicle Registration & Insurance', status: 'warning'   as const, expiry: null,         note: '1 vehicle insurance expires in 14 days' },
  { id: 7, category: 'Age Compliance', item: 'Age Verification Protocol',        status: 'compliant' as const, expiry: null,         note: 'ID scan required on all deliveries' },
  { id: 8, category: 'Reporting',      item: 'Monthly Sales Report',             status: 'compliant' as const, expiry: null,         note: 'Filed for June 2025' },
];

const auditLog = [
  { id: 1, date: 'Jul 10, 2025',  event: 'Daily inventory reconciliation completed',    user: 'System',    ok: true },
  { id: 2, date: 'Jul 10, 2025',  event: 'Driver John D. completed background refresh', user: 'Admin',     ok: true },
  { id: 3, date: 'Jul 9, 2025',   event: 'METRC manifest submitted for order #1042',    user: 'System',    ok: true },
  { id: 4, date: 'Jul 9, 2025',   event: 'Low-stock alert generated for Blue Dream',    user: 'System',    ok: false },
  { id: 5, date: 'Jul 8, 2025',   event: 'Monthly compliance report exported',          user: 'Admin',     ok: true },
  { id: 6, date: 'Jul 7, 2025',   event: 'New driver vehicle insurance uploaded',       user: 'Admin',     ok: true },
];

export default function CompliancePage() {
  // In production this would pull live data from the compliance service
  const compliant = complianceItems.filter(i => i.status === 'compliant').length;
  const warnings  = complianceItems.filter(i => i.status === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Compliance</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Michigan CRA regulatory status &amp; audit log</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Compliant',  value: compliant, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Warnings',   value: warnings,  color: 'text-amber-700',   bg: 'bg-amber-50' },
          { label: 'Violations', value: 0,         color: 'text-red-700',     bg: 'bg-red-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
              <span className={`text-xl font-bold ${color}`}>{value}</span>
            </div>
            <p className="text-sm font-semibold text-neutral-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Compliance checklist */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-neutral-50">
          <h2 className="text-sm font-bold text-neutral-900">Compliance Checklist</h2>
        </div>
        <div className="divide-y divide-neutral-50">
          {complianceItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  item.status === 'compliant' ? 'bg-emerald-500' :
                  item.status === 'warning'   ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900">{item.item}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{item.note}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                {item.expiry && (
                  <p className="text-xs text-neutral-400 hidden sm:block">Expires {item.expiry}</p>
                )}
                <span className="text-xs text-neutral-400 hidden sm:block">{item.category}</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit log */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-neutral-50">
          <h2 className="text-sm font-bold text-neutral-900">Recent Audit Log</h2>
        </div>
        <div className="divide-y divide-neutral-50">
          {auditLog.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
              <div className={`w-2 h-2 rounded-full shrink-0 ${entry.ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-800">{entry.event}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{entry.date} · {entry.user}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
