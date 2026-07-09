import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Headers,
  RawBodyRequest,
  HttpCode,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { Public, Roles, RolesGuard, CurrentUser, RequestUser } from '@cannaroute/shared';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /api/v1/payments/initiate
   * Customer initiates a payment for an order.
   * Returns redirect_url for CanPay/AeroPay or immediate confirmation for cash/POB.
   */
  @Post('initiate')
  initiate(
    @CurrentUser() user: RequestUser,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiate(user.id, dto);
  }

  /**
   * GET /api/v1/payments/order/:orderId
   * Get payment status for an order.
   */
  @Get('order/:orderId')
  getByOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentsService.findByOrderId(orderId);
  }

  /**
   * POST /api/v1/payments/webhook/canpay
   * CanPay posts payment events here. Public — verified by HMAC signature.
   *
   * Expects raw body (configured via NestJS rawBody option in main.ts).
   */
  @Post('webhook/canpay')
  @Public()
  @HttpCode(200)
  async canPayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-canpay-signature') signature: string,
    @Body() payload: any,
  ) {
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(payload);
    await this.paymentsService.handleCanPayWebhook(rawBody, signature ?? '', payload);
    return { received: true };
  }

  /**
   * POST /api/v1/payments/refund
   * Admin or dispensary staff can issue refunds.
   */
  @Post('refund')
  @Roles('platform_admin', 'dispensary_admin')
  @UseGuards(RolesGuard)
  refund(@Body() dto: RefundPaymentDto) {
    return this.paymentsService.refund(dto);
  }
}
