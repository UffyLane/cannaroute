'use client';

import { useQuery } from '@tanstack/react-query';
import { complianceApi } from '@/lib/api';

// Matches the actual ComplianceRules entity returned by the backend
interface StateRule {
  state_code: string;
  state_name: string;
  is_active: boolean;
  adult_use_allowed: boolean;
  medical_allowed: boolean;
  delivery_allowed: boolean;
  adult_use_flower_limit_grams: number | null;
  medical_flower_limit_grams: number | null;
  adult_use_concentrate_limit_grams: number | null;
  medical_concentrate_limit_grams: number | null;
  adult_use_edible_thc_limit_mg: number | null;
  medical_edible_thc_limit_mg: number | null;
  delivery_hours_start: string | null;
  delivery_hours_end: string | null;
  delivery_requires_age_verification: boolean;
  delivery_requires_signature: boolean;
  excise_tax_rate: number;
  sales_tax_rate: number;
  seed_to_sale_system: string | null;
  updated_at: string;
}

function fmt(v: number | null, unit = 'g') {
  if (v == null) return '—';
  return `${Number(v)}${unit}`;
}

export default function ComplianceRulesPage() {
  const { data: rules = [], isLoading } = useQuery<StateRule[]>({
    queryKey: ['compliance-rules'],
    queryFn: async () => {
      const { data } = await complianceApi.get('/compliance/rules');
      return Array.isArray(data) ? data : [];
    },
  });

  return (
    <div className="space-y-4">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {rules.filter((r) => r.is_active).length} active state
          {rules.filter((r) => r.is_active).length !== 1 ? 's' : ''} configured
        </p>
        <button
          className="text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
          style={{ backgroundColor: '#0f4c35' }}
        >
          + Add State
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2"
            style={{ borderColor: 'rgba(15,76,53,0.20)', borderTopColor: '#0f4c35' }}
          />
        </div>
      ) : rules.length === 0 ? (
        <div className="card p-14 text-center">
          <svg className="mx-auto mb-3" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          </svg>
          <p className="text-neutral-400 text-sm">No compliance rules configured</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.state_code} className="card p-5">
              {/* ── State header ── */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm font-bold px-3 py-1 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(15,76,53,0.10)',
                      color: '#0f4c35',
                      border: '1px solid rgba(15,76,53,0.18)',
                    }}
                  >
                    {rule.state_code}
                  </span>
                  <span className="font-semibold text-neutral-900">{rule.state_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="badge"
                    style={
                      rule.is_active
                        ? { backgroundColor: 'rgba(34,197,94,0.10)', color: '#166534' }
                        : { backgroundColor: 'rgba(0,0,0,0.05)', color: '#737373' }
                    }
                  >
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* ── Market flags ── */}
              <div className="flex flex-wrap gap-2 mb-5">
                {rule.adult_use_allowed && (
                  <span className="badge" style={{ backgroundColor: 'rgba(59,130,246,0.10)', color: '#1d4ed8' }}>
                    Adult Use
                  </span>
                )}
                {rule.medical_allowed && (
                  <span className="badge" style={{ backgroundColor: 'rgba(147,51,234,0.10)', color: '#7e22ce' }}>
                    Medical
                  </span>
                )}
                {rule.delivery_allowed && (
                  <span className="badge" style={{ backgroundColor: 'rgba(34,197,94,0.10)', color: '#166534' }}>
                    Delivery Permitted
                  </span>
                )}
                {rule.delivery_requires_age_verification && (
                  <span className="badge" style={{ backgroundColor: 'rgba(245,158,11,0.10)', color: '#92400e' }}>
                    Age Verification Required
                  </span>
                )}
                {rule.delivery_requires_signature && (
                  <span className="badge" style={{ backgroundColor: 'rgba(245,158,11,0.10)', color: '#92400e' }}>
                    Signature Required
                  </span>
                )}
              </div>

              {/* ── Details grid ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="text-xs text-neutral-400 font-medium mb-0.5">Adult-Use Flower Limit</p>
                  <p className="font-semibold text-neutral-900">{fmt(rule.adult_use_flower_limit_grams)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-medium mb-0.5">Medical Flower Limit</p>
                  <p className="font-semibold text-neutral-900">{fmt(rule.medical_flower_limit_grams)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-medium mb-0.5">Adult Concentrate Limit</p>
                  <p className="font-semibold text-neutral-900">{fmt(rule.adult_use_concentrate_limit_grams)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-medium mb-0.5">Adult Edibles Limit</p>
                  <p className="font-semibold text-neutral-900">{fmt(rule.adult_use_edible_thc_limit_mg, 'mg THC')}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-medium mb-0.5">Excise Tax</p>
                  <p className="font-semibold text-neutral-900">
                    {rule.excise_tax_rate != null ? `${(Number(rule.excise_tax_rate) * 100).toFixed(0)}%` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-medium mb-0.5">Sales Tax</p>
                  <p className="font-semibold text-neutral-900">
                    {rule.sales_tax_rate != null ? `${(Number(rule.sales_tax_rate) * 100).toFixed(0)}%` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-medium mb-0.5">Delivery Hours</p>
                  <p className="font-semibold text-neutral-900">
                    {rule.delivery_hours_start && rule.delivery_hours_end
                      ? `${rule.delivery_hours_start} – ${rule.delivery_hours_end}`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-medium mb-0.5">Seed-to-Sale System</p>
                  <p className="font-semibold text-neutral-900 capitalize">
                    {rule.seed_to_sale_system ?? '—'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
