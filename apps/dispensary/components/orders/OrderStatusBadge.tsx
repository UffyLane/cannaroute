import { Badge } from '@/components/ui/Badge';
import { OrderStatus } from '@/types';

const config: Record<OrderStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  preparing: { label: 'Preparing', variant: 'info' },
  ready_for_pickup: { label: 'Ready', variant: 'success' },
  in_transit: { label: 'In Transit', variant: 'info' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, variant } = config[status];
  return <Badge label={label} variant={variant} />;
}
