import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const Config = {
  apiBaseUrl: (process.env.EXPO_PUBLIC_API_BASE_URL ?? extra.apiBaseUrl ?? 'http://localhost:3001') as string,
  orderServiceUrl: (process.env.EXPO_PUBLIC_ORDER_SERVICE_URL ?? 'http://localhost:3002') as string,
  inventoryServiceUrl: (process.env.EXPO_PUBLIC_INVENTORY_SERVICE_URL ?? 'http://localhost:3003') as string,
  deliveryServiceUrl: (process.env.EXPO_PUBLIC_DELIVERY_SERVICE_URL ?? 'http://localhost:3004') as string,
  socketUrl: (process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3002') as string,
  googleMapsApiKey: (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '') as string,

  // Delivery purchase limits (Michigan defaults — compliance service enforces per-state)
  purchaseLimits: {
    flowerMaxGrams: 28,
    concentrateMaxGrams: 8,
    edibleMaxMg: 2000,
  },

  // Minimum age for access
  minimumAge: 21,
} as const;
