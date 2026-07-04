'use client';

import { useQuery } from '@tanstack/react-query';
import { deliveryApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Driver, DriverStatus } from '@/types';

const statusConfig: Record<DriverStatus, { label: string; variant: 'success' | 'info' | 'neutral' }> = {
  available: { label: 'Available', variant: 'success' },
  on_delivery: { label: 'On Delivery', variant: 'info' },
  offline: { label: 'Offline', variant: 'neutral' },
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

  const available = drivers.filter((d) => d.status === 'available').length;
  const onDelivery = drivers.filter((d) => d.status === 'on_delivery').length;

  return (
    <div className="space-y-5">
      {/* Summary pills */}
      <div className="flex gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-3">
          <p className="text-2xl font-bold text-green-700">{available}</p>
          <p className="text-xs text-green-600 mt-0.5">Available</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3">
          <p className="text-2xl font-bold text-blue-700">{onDelivery}</p>
          <p className="text-xs text-blue-600 mt-0.5">On Delivery</p>
        </div>
        <div className="bg-neutral-50 border border-neutral-100 rounded-xl px-5 py-3">
          <p className="text-2xl font-bold text-neutral-700">{drivers.length}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Total Drivers</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
          </div>
        ) : (
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>License</th>
                <th>Total Deliveries</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => {
                const { label, variant } = statusConfig[driver.status];
                return (
                  <tr key={driver.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-800 text-sm font-bold">
                          {driver.firstName[0]}
                        </div>
                        <div>
                          <p className="font-medium">{driver.firstName} {driver.lastName}</p>
                          <p className="text-xs text-neutral-400">{driver.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{driver.phone}</td>
                    <td>
                      {driver.vehicleYear} {driver.vehicleMake} {driver.vehicleModel}
                    </td>
                    <td className="font-mono text-xs">{driver.licenseNumber}</td>
                    <td className="text-center">{driver.totalDeliveries}</td>
                    <td><Badge label={label} variant={variant} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
