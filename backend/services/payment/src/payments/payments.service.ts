import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentProcessor, PaymentStatus } from './payment.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { CanPayClient, CanPayWebhookPayload } from './canpay.client';
import { RequestUser } from '@cannaroute/shared';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepo: Repository<Payment>,

    private readonly canPayClient: CanPayClient,
    private readonly config: ConfigService,
  ) {}

  // ─── Initiate Payment ─────────────────────────────────────────────────────

  async initiate(customerId: string, dto: InitiatePaymentDto): Promise<Payment> {
    // Prevent duplicate payments for the same order
    const existing = await this.paymentsRepo.findOne({ where: { order_id: dto.order_id } });
    if (existing && ['authorized', 'captured'].includes(existing.status)) {
      throw new BadRequestException(`Order ${dto.order_id} already has a captured payment`);
    }

    const processor = this.resolveProcessor(dto.payment_method);

    // For cash/POB — no external processor needed, create captured immediately
    if (processor === 'cash' || processor === 'point_of_banking') {
      const payment = this.paymentsRepo.create({
        order_id:       dto.order_id,
        customer_id:    customerId,
        dispensary_id:  dto.dispensary_id,
        amount_cents:   dto.amount_cents,
        processor,
        status:         processor === 'cash' ? 'pending' : 'authorized', // POB: authorized on pickup
        processor_transaction_id: null,
        processor_redirect_url:   null,
      });
      const saved = await this.paymentsRepo.save(payment);

      // Notify order service
      await this.notifyOrderService(dto.order_id, saved.status);

      return saved;
    }

    // For CanPay / AeroPay — initiate with external processor
    const returnUrl = dto.return_url ?? 'cannaroute://payment-complete';

    let processorResult: { transaction_id: string; redirect_url: string };

    if (processor === 'canpay') {
      processorResult = await this.canPayClient.initiatePayment({
        order_id:    dto.order_id,
        amount_cents: dto.amount_cents,
        return_url:  returnUrl,
        description: `CannaRoute Order`,
      });
    } else {
      throw new UnprocessableEntityException(`Processor '${processor}' not yet configured`);
    }

    const payment = this.paymentsRepo.create({
      order_id:                dto.order_id,
      customer_id:             customerId,
      dispensary_id:           dto.dispensary_id,
      amount_cents:            dto.amount_cents,
      processor,
      status:                  'pending',
      processor_transaction_id: processorResult.transaction_id,
      processor_redirect_url:   processorResult.redirect_url,
    });

    return this.paymentsRepo.save(payment);
  }

  // ─── Webhook: CanPay ──────────────────────────────────────────────────────

  async handleCanPayWebhook(rawBody: string, signature: string, payload: CanPayWebhookPayload): Promise<void> {
    // 1. Verify signature
    const valid = this.canPayClient.verifyWebhookSignature(rawBody, signature);
    if (!valid) {
      this.logger.warn('CanPay webhook: invalid signature');
      throw new ForbiddenException('Invalid webhook signature');
    }

    // 2. Find payment by transaction_id
    const payment = await this.paymentsRepo.findOne({
      where: { processor_transaction_id: payload.transaction_id },
    });
    if (!payment) {
      this.logger.warn(`CanPay webhook: no payment found for txn ${payload.transaction_id}`);
      return; // idempotent — don't throw
    }

    // 3. Map event to status
    const statusMap: Record<CanPayWebhookPayload['event'], PaymentStatus> = {
      'payment.authorized':  'authorized',
      'payment.captured':    'captured',
      'payment.failed':      'failed',
      'payment.refunded':    'refunded',
    };

    payment.status            = statusMap[payload.event] ?? payment.status;
    payment.processor_response = payload as unknown as Record<string, unknown>;
    await this.paymentsRepo.save(payment);

    // 4. Notify order service of payment status change
    await this.notifyOrderService(payment.order_id, payment.status);

    this.logger.log(`CanPay webhook processed: order=${payment.order_id} status=${payment.status}`);
  }

  // ─── Get Payment Status ───────────────────────────────────────────────────

  async findByOrderId(orderId: string): Promise<Payment> {
    const payment = await this.paymentsRepo.findOne({ where: { order_id: orderId } });
    if (!payment) throw new NotFoundException(`No payment found for order ${orderId}`);
    return payment;
  }

  // ─── Refund ───────────────────────────────────────────────────────────────

  async refund(dto: RefundPaymentDto): Promise<Payment> {
    const payment = await this.paymentsRepo.findOne({ where: { id: dto.payment_id } });
    if (!payment) throw new NotFoundException(`Payment ${dto.payment_id} not found`);

    if (!['captured', 'authorized'].includes(payment.status)) {
      throw new BadRequestException(`Cannot refund payment with status '${payment.status}'`);
    }

    const refundAmount = dto.amount_cents ?? payment.amount_cents;

    if (payment.processor === 'canpay' && payment.processor_transaction_id) {
      await this.canPayClient.refund({
        transaction_id: payment.processor_transaction_id,
        amount_cents:   refundAmount,
        reason:         dto.reason,
      });
    }
    // cash/POB: no external refund call needed

    const isPartial = refundAmount < payment.amount_cents;
    payment.status         = isPartial ? 'partially_refunded' : 'refunded';
    payment.refunded_cents = (payment.refunded_cents ?? 0) + refundAmount;

    const saved = await this.paymentsRepo.save(payment);

    // Notify order service
    await this.notifyOrderService(payment.order_id, 'refunded');

    return saved;
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private resolveProcessor(method: string): PaymentProcessor {
    const map: Record<string, PaymentProcessor> = {
      canpay:           'canpay',
      aeropay:          'aeropay',
      cash:             'cash',
      point_of_banking: 'point_of_banking',
      ach:              'canpay', // ACH is routed through CanPay
    };
    return map[method] ?? 'canpay';
  }

  /**
   * Calls the order service to update payment_status on the order.
   * Uses a fire-and-forget pattern — payment state is source of truth here.
   */
  private async notifyOrderService(orderId: string, paymentStatus: PaymentStatus | 'refunded'): Promise<void> {
    const orderUrl = this.config.get<string>('ORDER_SERVICE_URL', 'http://localhost:3002');

    try {
      const res = await fetch(`${orderUrl}/api/v1/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'payment-service',
        },
        body: JSON.stringify({ payment_status: paymentStatus }),
      });

      if (!res.ok) {
        this.logger.warn(`Order service payment status update failed: ${res.status}`);
      }
    } catch (err) {
      this.logger.error('Failed to notify order service of payment status', err);
      // Non-fatal — the payment record is the source of truth
    }
  }
}
