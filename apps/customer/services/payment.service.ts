import { api } from './api';

export interface InitiatePaymentParams {
  order_id: string;
  dispensary_id: string;
  amount_cents: number;
  payment_method: 'canpay' | 'aeropay' | 'cash' | 'point_of_banking';
  return_url?: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  amount_cents: number;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  processor: string;
  processor_redirect_url: string | null;
  created_at: string;
}

export const PaymentService = {
  /**
   * Initiate a payment for a placed order.
   * For CanPay: returns a processor_redirect_url the app opens via Linking.
   * For cash/POB: returns immediately with status 'authorized'.
   */
  async initiate(params: InitiatePaymentParams): Promise<PaymentRecord> {
    const { data } = await api.post('/payments/initiate', params, {
      baseURL: process.env.EXPO_PUBLIC_PAYMENT_SERVICE_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL,
    });
    return data;
  },

  /**
   * Get payment status for an order.
   */
  async getByOrderId(orderId: string): Promise<PaymentRecord> {
    const { data } = await api.get(`/payments/order/${orderId}`, {
      baseURL: process.env.EXPO_PUBLIC_PAYMENT_SERVICE_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL,
    });
    return data;
  },
};
