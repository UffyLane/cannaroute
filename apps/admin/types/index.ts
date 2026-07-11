export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'platform_admin' | 'admin' | 'dispensary_admin' | 'dispensary_staff' | 'driver' | 'grower' | 'customer';
  isVerified: boolean;
  createdAt: string;
}

export interface Dispensary {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  licenseNumber: string;
  isActive: boolean;
  createdAt: string;
}

export interface ComplianceRule {
  id: string;
  stateCode: string;
  productCategory: string;
  maxDailyGrams: number;
  maxSingleTransactionGrams: number;
  requiresMedicalCard: boolean;
  isMedicalOnly: boolean;
  notes?: string;
  effectiveDate: string;
}

export interface SystemHealth {
  services: Array<{
    name: string;
    status: 'ok' | 'degraded' | 'down';
    latencyMs: number;
    lastChecked: string;
  }>;
}

export interface PlatformStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeDispensaries: number;
  activeDrivers: number;
  activeGrowers: number;
}
