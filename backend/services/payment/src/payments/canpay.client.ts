import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface CanPayInitiateResult {
  transaction_id: string;
  redirect_url: string; // deep-link into CanPay app
  status: 'pending';
}

export interface CanPayWebhookPayload {
  event: 'payment.authorized' | 'payment.captured' | 'payment.failed' | 'payment.refunded';
  transaction_id: string;
  merchant_id: string;
  amount_cents: number;
  metadata?: Record<string, unknown>;
}

/**
 * CanPay API client — cannabis-compliant ACH debit processor.
 *
 * CanPay works as a digital debit solution:
 *   1. Merchant initiates a payment request with the order amount.
 *   2. CanPay returns a deep-link URL — the customer app opens the CanPay app.
 *   3. Customer authorizes the debit in the CanPay app.
 *   4. CanPay posts a webhook back to our /api/v1/payments/webhook/canpay endpoint.
 *   5. We mark the payment captured and update the order.
 *
 * Sandbox: https://sandbox.canpay.com/api/v1
 * Production: https://api.canpay.com/api/v1
 *
 * Docs: https://developer.canpay.com
 * Sign up for merchant account: https://canpay.com/merchant
 */
@Injectable()
export class CanPayClient {
  private readonly logger = new Logger(CanPayClient.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly merchantId: string;
  private readonly webhookSecret: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl    = config.get<string>('CANPAY_BASE_URL', 'https://sandbox.canpay.com/api/v1');
    this.apiKey     = config.get<string>('CANPAY_API_KEY', '');
    this.merchantId = config.get<string>('CANPAY_MERCHANT_ID', '');
    this.webhookSecret = config.get<string>('CANPAY_WEBHOOK_SECRET', '');
  }

  /**
   * Initiate a payment request.
   * Returns a redirect_url the customer app uses to open the CanPay app.
   */
  async initiatePayment(params: {
    order_id: string;
    amount_cents: number;
    return_url: string;
    description?: string;
  }): Promise<CanPayInitiateResult> {
    if (!this.apiKey) {
      // Dev fallback — returns a mock result so the service runs without credentials
      this.logger.warn('CANPAY_API_KEY not set — returning mock payment initiation');
      return {
        transaction_id: `mock_txn_${Date.now()}`,
        redirect_url: `cannaroute://payment-complete?order_id=${params.order_id}&status=mock`,
        status: 'pending',
      };
    }

    const body = {
      merchant_id:   this.merchantId,
      amount_cents:  params.amount_cents,
      order_ref:     params.order_id,
      return_url:    params.return_url,
      description:   params.description ?? `CannaRoute Order ${params.order_id}`,
    };

    const res = await fetch(`${this.baseUrl}/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key':    this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`CanPay initiate failed: ${res.status} — ${text}`);
      throw new Error(`CanPay initiation failed: ${res.status}`);
    }

    return res.json();
  }

  /**
   * Issue a refund for a previously captured payment.
   */
  async refund(params: {
    transaction_id: string;
    amount_cents: number;
    reason?: string;
  }): Promise<{ refund_id: string; status: 'refunded' }> {
    if (!this.apiKey) {
      this.logger.warn('CANPAY_API_KEY not set — returning mock refund');
      return { refund_id: `mock_refund_${Date.now()}`, status: 'refunded' };
    }

    const res = await fetch(`${this.baseUrl}/payments/${params.transaction_id}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key':    this.apiKey,
      },
      body: JSON.stringify({
        amount_cents: params.amount_cents,
        reason:       params.reason ?? 'Order cancellation',
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`CanPay refund failed: ${res.status} — ${text}`);
      throw new Error(`CanPay refund failed: ${res.status}`);
    }

    return res.json();
  }

  /**
   * Verify an incoming CanPay webhook signature.
   * CanPay signs the raw body with HMAC-SHA256 using your webhook secret.
   * The signature is in the X-CanPay-Signature header.
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('CANPAY_WEBHOOK_SECRET not set — skipping signature verification');
      return true; // allow in dev
    }
    const expected = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}
