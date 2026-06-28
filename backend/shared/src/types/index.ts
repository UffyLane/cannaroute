// CannaRoute — Shared TypeScript Interfaces
// Imported by all backend services. Keep in sync with database/schema.sql.

// ─── Roles ───────────────────────────────────────────────────────────────────

export type UserRole =
  | 'customer'
  | 'driver'
  | 'dispensary_admin'
  | 'grower'
  | 'platform_admin';

// ─── User ────────────────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  first_name: string;
  last_name: string;
  age_verified: boolean;
  age_verified_at: Date | null;
  dob: Date | null;
  is_medical: boolean;
  medical_card_number: string | null;
  medical_card_state: string | null;
  medical_card_expiry: Date | null;
  medical_verified: boolean;
  state_code: string | null;
  mfa_enabled: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// JWT payload — what gets encoded into the token
export interface JwtPayload {
  sub: string;       // user UUID
  email: string;
  role: UserRole;
  state_code: string | null;
  iat?: number;
  exp?: number;
}

// Attached to request by JwtAuthGuard — what controllers see as req.user
export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
  state_code: string | null;
}

// ─── Compliance ───────────────────────────────────────────────────────────────

export interface IComplianceRules {
  state_code: string;
  state_name: string;
  adult_use_enabled: boolean;
  medical_enabled: boolean;
  adult_use_per_transaction_g: number;
  medical_daily_limit_g: number;
  medical_monthly_limit_g: number;
  driver_carry_limit_g: number;
  delivery_start_time: string; // 'HH:MM:SS'
  delivery_end_time: string;
  seed_to_sale_system: 'metrc' | 'biotrack' | 'leafdata' | 'none';
  s2s_api_endpoint: string | null;
  s2s_sync_on_delivery: boolean;
  adult_use_excise_tax_rate: number;
  medical_excise_tax_rate: number;
  state_sales_tax_rate: number;
  id_verification_required: boolean;
  gps_tracking_required: boolean;
  delivery_manifest_required: boolean;
  customer_signature_required: boolean;
  proof_of_delivery_photo_req: boolean;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'point_of_banking' | 'ach' | 'cash';

export type OrderType = 'adult_use' | 'medical';

export interface IOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  weight_per_unit_g: number | null;
  total_weight_g: number | null;
  grower_id: string | null;
  lab_test_id: string | null;
  batch_number_snapshot: string | null;
  metrc_package_id_snapshot: string | null;
}

export interface IComplianceCheckResult {
  passed: boolean;
  checks: {
    age_verified: { pass: boolean };
    account_type_valid: { pass: boolean; detail?: string };
    purchase_limit: {
      pass: boolean;
      total_weight_g: number;
      limit_g: number;
      remaining_g: number;
    };
    delivery_zone: { pass: boolean; distance_mi?: number };
    delivery_hours: {
      pass: boolean;
      current_time_local?: string;
      allowed_window?: string;
    };
    coas_valid: {
      pass: boolean;
      checked: number;
      expired: number;
    };
  };
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'order_placed'
  | 'order_confirmed'
  | 'driver_assigned'
  | 'driver_picked_up'
  | 'driver_nearby'
  | 'order_delivered'
  | 'order_cancelled'
  | 'medical_card_expiring'
  | 'coa_expiring'
  | 'low_stock'
  | 'new_job';

export type NotificationChannel = 'push' | 'sms' | 'email';

export interface ISendNotificationPayload {
  user_id: string;
  order_id?: string;
  type: NotificationType;
  channel: NotificationChannel;
  title?: string;
  body: string;
  data?: Record<string, string>;
  fcm_token?: string;
  phone_number?: string;
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────

export interface WsOrderConfirmedEvent {
  order_id: string;
  dispensary_id: string;
  estimated_minutes?: number;
  status?: OrderStatus;
  confirmed_at?: string;
  driver_name?: string;
  driver_rating?: number;
}

export interface WsDriverPositionEvent {
  order_id: string;
  driver_id: string;
  lat: number;
  lng: number;
  eta_minutes: number;
  heading_deg: number;
}

export interface WsOrderDeliveredEvent {
  order_id: string;
  dispensary_id: string;
  delivered_at: string;
  status?: OrderStatus;
}

export interface WsNewJobEvent {
  order_id: string;
  dispensary_id: string;
  item_count: number;
  delivery_address?: string;
  total_cents?: number;
  order_number?: string;
  distance_mi?: number;
  weight_g?: number;
  base_pay_cents?: number;
  order_type?: OrderType;
  auto_decline_at?: string;
}
