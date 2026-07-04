'use client';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { SystemHealth } from '@/types';

const statusColors = {
  ok: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', label: 'Healthy' },
  degraded: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Degraded' },
  down: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700', label: 'Down' },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">System Health</h1>
          {dataUpdatedAt > 0 && (
            <p className="text-xs text-neutral-400 mt-0.5">
              Last checked {new Date(dataUpdatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {health && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${allOk ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <span className={`w-2 h-2 rounded-full ${allOk ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {allOk ? 'All Systems Operational' : 'Service Issues Detected'}
            </div>
          )}
          <button onClick={() => refetch()} className="text-sm text-brand-700 font-medium hover:underline">
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {health?.services.map((service) => {
            const cfg = statusColors[service.status];
            return (
              <div key={service.name} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-neutral-900 capitalize">
                    {service.name.replace(/-/g, ' ')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot} ${service.status === 'ok' ? 'animate-pulse' : ''}`} />
                    <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{service.latencyMs}ms</p>
                    <p className="text-xs text-neutral-400 mt-0.5">latency</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
