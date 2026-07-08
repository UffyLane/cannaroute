'use client';

import { useQuery } from '@tanstack/react-query';
import { complianceApi } from '@/lib/api';
import { ComplianceRule } from '@/types';

export default function ComplianceRulesPage() {
  const { data: rules = [], isLoading } = useQuery<ComplianceRule[]>({
    queryKey: ['compliance-rules'],
    queryFn: async () => {
      const { data } = await complianceApi.get('/compliance/rules');
      return data;
    },
  });

  const states = [...new Set(rules.map((r) => r.stateCode))].sort();

  return (
    <div className="space-y-4">
      {/* ── Page actions ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {rules.length} rule{rules.length !== 1 ? 's' : ''} across {states.length} state{states.length !== 1 ? 's' : ''}
        </p>
        <button
          className="text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
          style={{ backgroundColor: '#0f4c35' }}
        >
          + Add Rule
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
        <div className="space-y-6">
          {states.map((state) => {
            const stateRules = rules.filter((r) => r.stateCode === state);
            return (
              <div key={state}>
                {/* State header */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(15,76,53,0.10)',
                      color: '#0f4c35',
                      border: '1px solid rgba(15,76,53,0.18)',
                    }}
                  >
                    {state}
                  </span>
                  <span className="text-xs text-neutral-400">{stateRules.length} rule{stateRules.length !== 1 ? 's' : ''}</span>
                </div>

                {/* State table */}
                <div className="card p-0 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="th">Category</th>
                        <th className="th">Max Daily</th>
                        <th className="th">Max / Transaction</th>
                        <th className="th">Medical Only</th>
                        <th className="th">Requires Card</th>
                        <th className="th">Effective</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stateRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="td font-semibold text-neutral-900 capitalize">
                            {rule.productCategory.replace(/_/g, ' ')}
                          </td>
                          <td className="td text-neutral-600">{rule.maxDailyGrams}g</td>
                          <td className="td text-neutral-600">{rule.maxSingleTransactionGrams}g</td>
                          <td className="td">
                            <span
                              className="badge"
                              style={
                                rule.isMedicalOnly
                                  ? { backgroundColor: 'rgba(147,51,234,0.10)', color: '#7e22ce' }
                                  : { backgroundColor: 'rgba(0,0,0,0.05)', color: '#737373' }
                              }
                            >
                              {rule.isMedicalOnly ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="td">
                            <span
                              className="badge"
                              style={
                                rule.requiresMedicalCard
                                  ? { backgroundColor: 'rgba(245,158,11,0.10)', color: '#92400e' }
                                  : { backgroundColor: 'rgba(0,0,0,0.05)', color: '#737373' }
                              }
                            >
                              {rule.requiresMedicalCard ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="td text-neutral-400 text-xs">{rule.effectiveDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
