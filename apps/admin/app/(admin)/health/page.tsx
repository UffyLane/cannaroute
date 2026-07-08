'use client';

import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { SystemHealth } from '@/types';

const statusConfig = {
  ok: {
    cardBg: 'rgba(34,197,94,0.05)',
    cardBorder: 'rgba(34,197,94,0.18)',
    dotColor: '#22c55e',
    badgeBg: 'rgba(34,197,94,0.10)',
    badgeColor: '#166534',
    label: 'Healthy',
    pulse: true,
  },
  degraded: {
    cardBg: 'rgba(245,158,11,0.05)',
    cardBorder: 'rgba(245,158,11,0.22)',
    dotColor: '#f59e0b',
    badgeBg: 'rgba(245,158,11,0.10)',
    badgeColor: '#92400e',
    label: 'Degraded',
    pulse: false,
  },
  down: {
    cardBg: 'rgba(239,68,68,0.05)',
    cardBorder: 'rgba(239,68,68,0.18)',
    dotColor: '#ef4444',
    badgeBg: 'rgba(239,68,68,0.10)',
    badgeColor: '#991b1b',
    label: 'Down',
    pulse: false,
  },
};

export default function SystemHealthPage() {
  const { data: health, isLoading, dataUpdatedAt, refetch } = useQuery<SystemHealth>({
    queryKey: ['system-health'],
    queryFn: async () => {
      const { data } = await authApi.get('/admin/health');
      return data;
    },
    refetchInterval: 30_000,
  });

  const allOk = health?.services.every((s) => s.status === 'ok');

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          {dataUpdatedAt > 0 && (
            <p className="text-xs text-neutral-400">
              Last checked {new Date(dataUpdatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {health && (
            <div
              className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={
                allOk
                  ? { backgroundColor: 'rgba(34,197,94,0.10)', color: '#166534', border: '1px solid rgba(34,197,94,0.20)' }
                  : { backgroundColor: 'rgba(239,68,68,0.10)', color: '#991b1b', border: '1px solid rgba(239,68,68,0.20)' }
              }
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: allOk ? '#22c55e' : '#ef4444',
                  animation: allOk ? 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' : 'none',
                }}
              />
              {allOk ? 'All Systems Operational' : 'Issues Detected'}
            </div>
          )}
          <button
            onClick={() => refetch()}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors text-neutral-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2"
            style={{ borderColor: 'rgba(15,76,53,0.20)', borderTopColor: '#0f4c35' }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {health?.services.map((service) => {
            const cfg = statusConfig[service.status] ?? statusConfig.down;
            return (
              <div
                key={service.name}
                className="rounded-2xl p-5 border transition-all"
                style={{ backgroundColor: cfg.cardBg, borderColor: cfg.cardBorder }}
              >
                {/* Service name + status */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-neutral-900 capitalize">
                    {service.name.replace(/-/g, ' ')}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: cfg.dotColor,
                        animation: cfg.pulse ? 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' : 'none',
                      }}
                    />
                    <span
                      className="badge"
                      style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeColor }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Latency */}
                <div>
                  <p
                    className="text-3xl font-bold tabular-nums"
                    style={{ color: service.status === 'down' ? '#dc2626' : '#171717' }}
                  >
                    {service.latencyMs}
                    <span className="text-base font-normal text-neutral-400 ml-1">ms</span>
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">response latency</p>
                </div>
              </div>
            );
          })}

          {(!health || health.services.length === 0) && (
            <div className="col-span-3 text-center py-16 text-neutral-400 text-sm">
              No health data available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
