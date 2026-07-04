import { deliveryApi } from './api';
import { Delivery, DeliveryStatus } from '@/types';

export const DeliveryService = {
  async getMyDeliveries(): Promise<Delivery[]> {
    const { data } = await deliveryApi.get<Delivery[]>('/deliveries/my');
    return data;
  },

  async getActiveDelivery(): Promise<Delivery | null> {
    const { data } = await deliveryApi.get<Delivery | null>('/deliveries/my/active');
    return data;
  },

  async updateStopStatus(
    deliveryId: string,
    stopId: string,
    status: DeliveryStatus,
  ): Promise<void> {
    await deliveryApi.patch(`/deliveries/${deliveryId}/stops/${stopId}/status`, { status });
  },

  async uploadProofOfDelivery(
    deliveryId: string,
    stopId: string,
    photoUri: string,
  ): Promise<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      name: `pod_${stopId}.jpg`,
      type: 'image/jpeg',
    } as unknown as Blob);
    const { data } = await deliveryApi.post<{ photoUrl: string }>(
      `/deliveries/${deliveryId}/stops/${stopId}/proof`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};
