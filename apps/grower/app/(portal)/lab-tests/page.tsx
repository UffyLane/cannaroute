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
    queryFn: async () => {
      const { data } = await growerApi.get('/grower/me/lab-tests');
      return data;
    },
  });

  const { mutate: uploadCoa } = useMutation({
    mutationFn: async ({ testId, file }: { testId: string; file: File }) => {
      const fd = new FormData();
      fd.append('coa', file);
      await growerApi.post(`/grower/me/lab-tests/${testId}/coa`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-tests'] });
      toast.success('COA uploaded');
    },
    onError: () => toast.error('Upload failed'),
  });

  const handleFileChange = (testId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadCoa({ testId, file });
  };

  return (
    <div className="space-y-4">
      {/* ── Page actions ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{tests.length} test{tests.length !== 1 ? 's' : ''} on file</p>
        <button
          className="text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
          style={{ backgroundColor: '#0f4c35' }}
        >
          + Submit Test
        </button>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2"
              style={{ borderColor: 'rgba(15,76,53,0.20)', borderTopColor: '#0f4c35' }}
            />
          </div>
        ) : (
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Product</th>
                <th>Lab</th>
                <th>THC</th>
                <th>CBD</th>
                <th>Result</th>
                <th>Tested</th>
                <th>COA</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td className="font-semibold text-neutral-900">{test.productName}</td>
                  <td className="text-neutral-600">{test.labName}</td>
                  <td className="text-neutral-600">
                    {test.thcPercentage !== undefined ? `${test.thcPercentage.toFixed(1)}%` : '—'}
                  </td>
                  <td className="text-neutral-600">
                    {test.cbdPercentage !== undefined ? `${test.cbdPercentage.toFixed(1)}%` : '—'}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={
                        test.overallPass
                          ? { backgroundColor: 'rgba(34,197,94,0.10)', color: '#166534' }
                          : { backgroundColor: 'rgba(239,68,68,0.10)', color: '#991b1b' }
                      }
                    >
                      {test.overallPass ? 'Pass' : 'Fail'}
                    </span>
                  </td>
                  <td className="text-neutral-500 text-xs">{formatDate(test.testedAt)}</td>
                  <td>
                    {test.coaUrl ? (
                      <a
                        href={test.coaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold hover:underline"
                        style={{ color: '#0f4c35' }}
                      >
                        View PDF →
                      </a>
                    ) : (
                      <label
                        className="text-xs font-semibold cursor-pointer transition-colors"
                        style={{ color: 'rgba(15,76,53,0.50)' }}
                      >
                        Upload COA
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => handleFileChange(test.id, e)}
                        />
                      </label>
                    )}
                  </td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400 text-sm">
                    No lab tests on file — submit your first test to get started
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
