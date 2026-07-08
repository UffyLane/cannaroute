'use client';

import { useQuery } from '@tanstack/react-query';
import { deliveryApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Driver, DriverStatus } from '@/types';

const statusConfig: Record<DriverStatus, { label: string; variant: 'success' | 'info' | 'neutral' }> = {
  available:   { label: 'Available',   variant: 'success' },
  on_delivery: { label: 'On Delivery', variant: 'info' },
  offline:     { label: 'Offline',     variant: 'neutral' },
};

export default function DriversPage() {
  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await deliveryApi.get('/drivers');
      return data;
    },
    refetchInterval: 20_000,
  });

  const available  = drivers.filter((d) => d.status === 'available').length;
  const onDelivery = drivers.filter((d) => d.status === 'on_delivery').length;

  const summaryCards = [
    {
      value: available,
      label: 'Available',
      bg: 'rgba(34,197,94,0.07)',
      border: 'rgba(34,197,94,0.18)',
      valueColor: '#16a34a',
      labelColor: '#15803d',
    },
    {
      value: onDelivery,
      label: 'On Delivery',
      bg: 'rgba(59,130,246,0.07)',
      border: 'rgba(59,130,246,0.18)',
      valueColor: '#2563eb',
      labelColor: '#1d4ed8',
    },
    {
      value: drivers.length,
      label: 'Total Drivers',
      bg: 'rgba(0,0,0,0.03)',
      border: 'rgba(0,0,0,0.08)',
      valueColor: '#404040',
      labelColor: '#737373',
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Summary stat pills ── */}
      <div className="flex gap-4 flex-wrap">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl px-6 py-4 border"
            style={{ backgroundColor: card.bg, borderColor: card.border }}
          >
            <p className="text-2xl font-bold tabular-nums" style={{ color: card.valueColor }}>
              {card.value}
            </p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: card.labelColor }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Driver table ── */}
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
                <th>Driver</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>License</th>
                <th>Deliveries</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => {
                const { label, variant } = statusConfig[driver.status];
                const initials = `${driver.firstName?.[0] ?? ''}${driver.lastName?.[0] ?? ''}`.toUpperCase();
                return (
                  <tr key={driver.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: '#0f4c35' }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">
                            {driver.firstName} {driver.lastName}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">{driver.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-neutral-600">{driver.phone}</td>
                    <td className="text-neutral-600">
                      {driver.vehicleYear} {driver.vehicleMake} {driver.vehicleModel}
                    </td>
                    <td className="font-mono text-xs text-neutral-500">{driver.licenseNumber}</td>
                    <td className="text-center font-semibold text-neutral-700">
                      {driver.totalDeliveries}
                    </td>
                    <td>
                      <Badge label={label} variant={variant} />
                    </td>
                  </tr>
                );
              })}
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-400 text-sm">
                    No drivers registered yet
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
