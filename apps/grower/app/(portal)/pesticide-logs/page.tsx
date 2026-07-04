'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { growerApi } from '@/lib/api';
import { PesticideLog } from '@/types';
import { formatDate } from '@/lib/utils';

export default function PesticideLogsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [noPesticides, setNoPesticides] = useState(false);
  const [form, setForm] = useState({
    pesticideName: '', epaRegNumber: '', appliedDate: '', applicationRate: '', applicationRateUnit: 'oz/acre',
  });

  const { data: logs = [], isLoading } = useQuery<PesticideLog[]>({
    queryKey: ['pesticide-logs'],
    queryFn: async () => { const { data } = await growerApi.get('/grower/me/pesticide-logs'); return data; },
  });

  const { mutate: addLog, isPending } = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      await growerApi.post('/grower/me/pesticide-logs', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pesticide-logs'] });
      toast.success('Log added');
      setShowForm(false);
    },
    onError: () => toast.error('Failed to add log'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noPesticides) {
      addLog({ noPesticidesUsed: true });
    } else {
      addLog({ noPesticidesUsed: false, ...form, applicationRate: Number(form.applicationRate) });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Pesticide Logs</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-brand-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-brand-800 transition-colors"
        >
          + Add Log
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-sm font-semibold text-neutral-700">New Pesticide Log</h2>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="form-checkbox" checked={noPesticides} onChange={(e) => setNoPesticides(e.target.checked)} />
            <span className="text-sm text-neutral-700 font-medium">No pesticides used (certify pesticide-free)</span>
          </label>

          {!noPesticides && (
            <>
              <div>
                <label className="form-label">Pesticide Name *</label>
                <input className="form-input" value={form.pesticideName} onChange={(e) => setForm({ ...form, pesticideName: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">EPA Reg # (e.g. 12345-67890)</label>
                  <input className="form-input" placeholder="XXXXX-XXXXX" value={form.epaRegNumber} onChange={(e) => setForm({ ...form, epaRegNumber: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Date Applied</label>
                  <input type="date" className="form-input" value={form.appliedDate} onChange={(e) => setForm({ ...form, appliedDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Application Rate</label>
                  <input type="number" className="form-input" value={form.applicationRate} onChange={(e) => setForm({ ...form, applicationRate: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Unit</label>
                  <select className="form-input" value={form.applicationRateUnit} onChange={(e) => setForm({ ...form, applicationRateUnit: e.target.value })}>
                    <option>oz/acre</option><option>fl oz/gal</option><option>g/L</option><option>lb/acre</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isPending} className="bg-brand-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-brand-800 disabled:opacity-50">
              {isPending ? 'Saving…' : 'Save Log'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-neutral-600 px-4 py-2.5 rounded-xl hover:bg-neutral-100">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Pesticide</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">EPA Reg #</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Rate</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Applied</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Logged</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <span className={`badge ${log.noPesticidesUsed ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700'}`}>
                      {log.noPesticidesUsed ? 'Pesticide-Free' : 'Applied'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-800">{log.pesticideName ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-mono text-neutral-500">{log.epaRegNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {log.applicationRate ? `${log.applicationRate} ${log.applicationRateUnit ?? ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{log.appliedDate ? formatDate(log.appliedDate) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-neutral-400">{formatDate(log.createdAt)}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-400">No pesticide logs on file</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
