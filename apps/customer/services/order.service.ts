import { orderApi } from './api';
import { Order, DeliveryTracking, CartItem } from '@/types';

interface PlaceOrderPayload {
  dispensaryId: string;
  items: Array<{ productId: string; quantity: number }>;
  deliveryAddress: string;
  isMedical?: boolean;
}

export const OrderService = {
  async placeOrder(payload: PlaceOrderPayload): Promise<Order> {
    const { data } = await orderApi.post<Order>('/orders', payload);
    return data;
  },

  async getOrders(): Promise<Order[]> {
    const { data } = await orderApi.get<Order[]>('/orders/my');
    return data;
  },

  async getOrderById(id: string): Promise<Order> {
    const { data } = await orderApi.get<Order>(`/orders/${id}`);
    return data;
  },

  async cancelOrder(id: string): Promise<Order> {
    const { data } = await orderApi.patch<Order>(`/orders/${id}/cancel`);
    return data;
  },

  async getDeliveryTracking(orderId: string): Promise<DeliveryTracking> {
    const { data } = await orderApi.get<DeliveryTracking>(`/orders/${orderId}/tracking`);
    return data;
  },

  /** Build a PlaceOrderPayload from the current cart items */
  cartItemsToPayload(
    items: CartItem[],
  ): Array<{ productId: string; quantity: number }> {
    return items.map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
    }));
  },
};
