export type DeliveryStatus =
  | 'assigned'
  | 'en_route_to_dispensary'
  | 'picked_up'
  | 'en_route_to_customer'
  | 'delivered'
  | 'failed';

export interface DeliveryStop {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  items: Array<{ name: string; quantity: number; weightGrams: number }>;
  status: DeliveryStatus;
  estimatedArrivalAt?: string;
  deliveredAt?: string;
  proofOfDeliveryUrl?: string;
  orderTotal: number;
  specialInstructions?: string;
}

export interface Delivery {
  id: string;
  dispensaryName: string;
  dispensaryAddress: string;
  dispensaryLatitude: number;
  dispensaryLongitude: number;
  stops: DeliveryStop[];
  status: DeliveryStatus;
  createdAt: string;
}

export interface DriverProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  isActive: boolean;
  totalDeliveries: number;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}
