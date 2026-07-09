import { IsUUID, IsInt, IsPositive, IsEnum, IsOptional, IsString } from 'class-validator';

export type PaymentMethodInput = 'canpay' | 'aeropay' | 'cash' | 'point_of_banking';

export class InitiatePaymentDto {
  @IsUUID()
  order_id: string;

  @IsUUID()
  dispensary_id: string;

  /** Total in cents — must match order total (validated server-side) */
  @IsInt()
  @IsPositive()
  amount_cents: number;

  @IsEnum(['canpay', 'aeropay', 'cash', 'point_of_banking'])
  payment_method: PaymentMethodInput;

  /**
   * Deep-link return URL — the customer app registers a custom scheme
   * (e.g. cannaroute://payment-complete) so the processor app can hand
   * control back after the customer authorizes.
   */
  @IsOptional()
  @IsString()
  return_url?: string;
}
