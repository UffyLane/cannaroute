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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Compliance Rules</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Purchase limits and medical requirements by state</p>
        </div>
        <button className="bg-brand-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-brand-800 transition-colors">
          + Add Rule
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {states.map((state) => (
            <div key={state}>
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-3">{state}</h2>
              <div className="card p-0 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="th">Category</th>
                      <th className="th">Max Daily (g)</th>
                      <th className="th">Max Per Transaction (g)</th>
                      <th className="th">Medical Only</th>
                      <th className="th">Requires Card</th>
                      <th className="th">Effective</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.filter((r) => r.stateCode === state).map((rule) => (
                      <tr key={rule.id} className="hover:bg-neutral-50">
                        <td className="td font-medium capitalize">{rule.productCategory.replace('_', ' ')}</td>
                        <td className="td">{rule.maxDailyGrams}g</td>
                        <td className="td">{rule.maxSingleTransactionGrams}g</td>
                        <td className="td">
                          <span className={`badge ${rule.isMedicalOnly ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-600'}`}>
                            {rule.isMedicalOnly ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="td">
                          <span className={`badge ${rule.requiresMedicalCard ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-600'}`}>
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
          ))}

          {rules.length === 0 && (
            <div className="card p-12 text-center text-neutral-400">
              <p className="text-4xl mb-3">⚖️</p>
              <p>No compliance rules configured</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
