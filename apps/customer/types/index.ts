// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'dispensary_staff' | 'driver' | 'grower' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  isMedical: boolean;
  medicalCardUrl?: string;
  dateOfBirth?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

// ─── Dispensary ───────────────────────────────────────────────────────────────

export interface Dispensary {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  latitude: number;
  longitude: number;
  distanceMiles?: number;
  isOpen: boolean;
  rating: number;
  reviewCount: number;
  logoUrl?: string;
  deliveryAvailable: boolean;
  minOrderAmount: number;
  deliveryFee: number;
  estimatedDeliveryMinutes: number;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'flower'
  | 'concentrate'
  | 'edible'
  | 'tincture'
  | 'topical'
  | 'vape'
  | 'pre_roll'
  | 'accessory';

export interface Grower {
  id: string;
  farmName: string;
  city: string;
  state: string;
  cleanGreenCertified: boolean;
  sunEarthCertified: boolean;
  usdaOrganic: boolean;
  noPesticidesUsed: boolean;
  outdoorGrown: boolean;
  indoorGrown: boolean;
  greenhouseGrown: boolean;
}

export interface LabTest {
  id: string;
  labName: string;
  thcPercentage: number;
  cbdPercentage: number;
  overallPass: boolean;
  testedAt: string;
  coaUrl?: string;
}

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
  grower?: Grower;
  latestLabTest?: LabTest;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  dispensaryId: string;
  items: CartItem[];
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
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
  dispensaryId: string;
  dispensaryName: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryAddress: string;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

// ─── Delivery Tracking ────────────────────────────────────────────────────────

export interface DriverLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  updatedAt: string;
}

export interface DeliveryTracking {
  orderId: string;
  driverName: string;
  driverPhone?: string;
  currentLocation?: DriverLocation;
  estimatedArrivalMinutes?: number;
  status: OrderStatus;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
