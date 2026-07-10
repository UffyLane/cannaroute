'use client';

const licenseItems = [
  { category: 'License',    item: 'Class C Grower License',         status: 'compliant' as const, expiry: '2025-12-31', note: 'Michigan CRA License #GR-00712' },
  { category: 'License',    item: 'State Operating Permit',          status: 'compliant' as const, expiry: '2025-08-15', note: 'Annual renewal in August' },
  { category: 'Tracking',   item: 'METRC Plant Tracking',           status: 'compliant' as const, expiry: null,         note: 'All plants tagged and tracked' },
  { category: 'Tracking',   item: 'Harvest Manifest Submissions',   status: 'compliant' as const, expiry: null,         note: 'Last manifest: Jul 8, 2025' },
  { category: 'Testing',    item: 'Third-Party Lab Testing',        status: 'compliant' as const, expiry: null,         note: 'All batches tested before sale' },
  { category: 'Testing',    item: 'Pesticide Residue Reports',      status: 'warning'   as const, expiry: null,         note: '1 batch awaiting July test results' },
  { category: 'Facility',   item: 'Security System Certification',  status: 'compliant' as const, expiry: '2026-01-20', note: 'Camera and access control certified' },
  { category: 'Facility',   item: 'Waste Disposal Protocol',        status: 'compliant' as const, expiry: null,         note: 'Quarterly disposal logs filed' },
];

const auditLog = [
  { date: 'Jul 10, 2025', event: 'METRC plant inventory auto-reconciled',         ok: true  },
  { date: 'Jul 9, 2025',  event: 'Harvest manifest submitted — Blue Dream batch', ok: true  },
  { date: 'Jul 8, 2025',  event: 'Lab test results uploaded — OG Kush',           ok: true  },
  { date: 'Jul 7, 2025',  event: 'Pesticide log updated — Sour Diesel crop',      ok: true  },
  { date: 'Jul 5, 2025',  event: 'Missing test report flag — 1 batch (pending)',  ok: false },
  { date: 'Jul 1, 2025',  event: 'Monthly compliance summary exported',            ok: true  },
];

type StatusType = 'compliant' | 'warning' | 'violation';

function StatusBadge({ status }: { status: StatusType }) {
  const map = {
    compliant: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Compliant' },
    warning:   { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Warning'   },
    violation: { bg: 'bg-red-50',     text: 'text-red-700',     label: 'Violation' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

export default function GrowerCompliancePage() {
  const compliant = licenseItems.filter(i => i.status === 'compliant').length;
  const warnings  = licenseItems.filter(i => i.status === 'warning').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Compliance</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Michigan CRA grower regulatory status &amp; audit log</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Compliant',  value: compliant, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Warnings',   value: warnings,  color: 'text-amber-700',   bg: 'bg-amber-50'   },
          { label: 'Violations', value: 0,         color: 'text-red-700',     bg: 'bg-red-50'     },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
              <span className={`text-xl font-bold ${color}`}>{value}</span>
            </div>
            <p className="text-sm font-semibold text-neutral-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-neutral-50">
          <h2 className="text-sm font-bold text-neutral-900">Compliance Checklist</h2>
        </div>
        <div className="divide-y divide-neutral-50">
          {licenseItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  item.status === 'compliant' ? 'bg-emerald-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900">{item.item}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{item.note}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                {item.expiry && <p className="text-xs text-neutral-400 hidden sm:block">Expires {item.expiry}</p>}
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
          {auditLog.map((entry, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <div className={`w-2 h-2 rounded-full shrink-0 ${entry.ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-800">{entry.event}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{entry.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
