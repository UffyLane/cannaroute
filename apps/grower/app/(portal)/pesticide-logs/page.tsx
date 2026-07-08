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
    pesticideName: '',
    epaRegNumber: '',
    appliedDate: '',
    applicationRate: '',
    applicationRateUnit: 'oz/acre',
  });

  const { data: logs = [], isLoading } = useQuery<PesticideLog[]>({
    queryKey: ['pesticide-logs'],
    queryFn: async () => {
      const { data } = await growerApi.get('/grower/me/pesticide-logs');
      return data;
    },
  });

  const { mutate: addLog, isPending } = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      await growerApi.post('/grower/me/pesticide-logs', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pesticide-logs'] });
      toast.success('Log added');
      setShowForm(false);
      setForm({ pesticideName: '', epaRegNumber: '', appliedDate: '', applicationRate: '', applicationRateUnit: 'oz/acre' });
      setNoPesticides(false);
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
    <div className="space-y-4">
      {/* ── Page actions ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{logs.length} log{logs.length !== 1 ? 's' : ''} recorded</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
          style={{ backgroundColor: showForm ? '#0c3324' : '#0f4c35' }}
        >
          {showForm ? '✕ Cancel' : '+ Add Log'}
        </button>
      </div>

      {/* ── Add log form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-sm font-bold text-neutral-900">New Pesticide Log</h2>

          {/* Pesticide-free toggle */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-neutral-200 hover:border-emerald-300 transition-colors">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={noPesticides}
              onChange={(e) => setNoPesticides(e.target.checked)}
            />
            <div>
              <p className="text-sm font-semibold text-neutral-800">No pesticides used</p>
              <p className="text-xs text-neutral-500 mt-0.5">Certify this batch as pesticide-free</p>
            </div>
          </label>

          {!noPesticides && (
            <>
              <div>
                <label htmlFor="pesticideName" className="form-label">Pesticide Name *</label>
                <input
                  id="pesticideName"
                  className="form-input"
                  placeholder="e.g. Spinosad"
                  value={form.pesticideName}
                  onChange={(e) => setForm({ ...form, pesticideName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="epaRegNumber" className="form-label">EPA Reg #</label>
                  <input
                    id="epaRegNumber"
                    className="form-input"
                    placeholder="XXXXX-XXXXX"
                    value={form.epaRegNumber}
                    onChange={(e) => setForm({ ...form, epaRegNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="appliedDate" className="form-label">Date Applied</label>
                  <input
                    id="appliedDate"
                    type="date"
                    className="form-input"
                    value={form.appliedDate}
                    onChange={(e) => setForm({ ...form, appliedDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="applicationRate" className="form-label">Application Rate</label>
                  <input
                    id="applicationRate"
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={form.applicationRate}
                    onChange={(e) => setForm({ ...form, applicationRate: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="applicationRateUnit" className="form-label">Unit</label>
                  <select
                    id="applicationRateUnit"
                    className="form-input"
                    value={form.applicationRateUnit}
                    onChange={(e) => setForm({ ...form, applicationRateUnit: e.target.value })}
                  >
                    <option>oz/acre</option>
                    <option>fl oz/gal</option>
                    <option>g/L</option>
                    <option>lb/acre</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
              style={{ backgroundColor: '#0f4c35' }}
            >
              {isPending ? 'Saving…' : 'Save Log'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-neutral-500 px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Log table ── */}
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
                <th>Status</th>
                <th>Pesticide</th>
                <th>EPA Reg #</th>
                <th>Rate</th>
                <th>Applied</th>
                <th>Logged</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span
                      className="badge"
                      style={
                        log.noPesticidesUsed
                          ? { backgroundColor: 'rgba(34,197,94,0.10)', color: '#166534' }
                          : { backgroundColor: 'rgba(0,0,0,0.05)', color: '#525252' }
                      }
                    >
                      {log.noPesticidesUsed ? 'Pesticide-Free' : 'Applied'}
                    </span>
                  </td>
                  <td className="font-medium text-neutral-800">{log.pesticideName ?? '—'}</td>
                  <td className="font-mono text-xs text-neutral-500">{log.epaRegNumber ?? '—'}</td>
                  <td className="text-neutral-600">
                    {log.applicationRate
                      ? `${log.applicationRate} ${log.applicationRateUnit ?? ''}`
                      : '—'}
                  </td>
                  <td className="text-neutral-500 text-xs">
                    {log.appliedDate ? formatDate(log.appliedDate) : '—'}
                  </td>
                  <td className="text-neutral-400 text-xs">{formatDate(log.createdAt)}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-400 text-sm">
                    No pesticide logs recorded yet
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
