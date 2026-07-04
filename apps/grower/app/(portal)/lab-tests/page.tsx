'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { growerApi } from '@/lib/api';
import { LabTest } from '@/types';
import { formatDate } from '@/lib/utils';

export default function LabTestsPage() {
  const qc = useQueryClient();

  const { data: tests = [], isLoading } = useQuery<LabTest[]>({
    queryKey: ['lab-tests'],
    queryFn: async () => { const { data } = await growerApi.get('/grower/me/lab-tests'); return data; },
  });

  const { mutate: uploadCoa } = useMutation({
    mutationFn: async ({ testId, file }: { testId: string; file: File }) => {
      const fd = new FormData();
      fd.append('coa', file);
      await growerApi.post(`/grower/me/lab-tests/${testId}/coa`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lab-tests'] }); toast.success('COA uploaded'); },
    onError: () => toast.error('Upload failed'),
  });

  const handleFileChange = (testId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadCoa({ testId, file });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Lab Tests & COAs</h1>
        <button className="bg-brand-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-brand-800 transition-colors">
          + Submit Test
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Lab</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">THC</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">CBD</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Result</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Tested</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">COA</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">{test.productName}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{test.labName}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {test.thcPercentage !== undefined ? `${test.thcPercentage.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {test.cbdPercentage !== undefined ? `${test.cbdPercentage.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${test.overallPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {test.overallPass ? 'Pass' : 'Fail'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{formatDate(test.testedAt)}</td>
                  <td className="px-4 py-3">
                    {test.coaUrl ? (
                      <a href={test.coaUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-700 font-medium hover:underline">
                        View PDF
                      </a>
                    ) : (
                      <label className="text-xs text-neutral-400 hover:text-brand-700 cursor-pointer">
                        Upload
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileChange(test.id, e)} />
                      </label>
                    )}
                  </td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-neutral-400">
                    No lab tests on file
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
