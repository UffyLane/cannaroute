// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'placed'      // backend canonical (shown as "Pending" in UI)
  | 'pending'     // legacy alias kept for compat
  | 'confirmed'
  | 'preparing'
  | 'picked_up'   // backend canonical (shown as "Ready for Pickup" in UI)
  | 'ready_for_pickup' // legacy alias kept for compat
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  weightGrams: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  dispensaryId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryAddress: string;
  driverId?: string;
  driverName?: string;
  estimatedDeliveryAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'flower'
  | 'concentrate'
  | 'edible'
  | 'tincture'
  | 'topical'
  | 'vape'
  | 'pre_roll'
  | 'accessory';

export interface Product {
  id: string;
  dispensaryId: string;
  name: string;
  description: string;
  category: ProductCategory;
  strain?: string;
  thcPercentage?: number;
  cbdPercentage?: number;
  weightGrams: number;
  pricePerUnit: number;
  stockQuantity: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Drivers ──────────────────────────────────────────────────────────────────

export type DriverStatus = 'available' | 'on_delivery' | 'offline';

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: DriverStatus;
  licenseNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  currentDeliveryId?: string;
  totalDeliveries: number;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DailyStat {
  date: string;
  orders: number;
  revenue: number;
}

export interface DispensaryStats {
  ordersToday: number;
  revenueToday: number;
  activeDrivers: number;
  pendingOrders: number;
  weeklyData: DailyStat[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'dispensary_staff' | 'admin';
  dispensaryId: string;
}
