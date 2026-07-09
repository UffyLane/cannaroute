import { IsUUID, IsInt, IsPositive, IsOptional, IsString } from 'class-validator';

export class RefundPaymentDto {
  @IsUUID()
  payment_id: string;

  /**
   * Amount to refund in cents.
   * Omit for full refund.
   */
  @IsOptional()
  @IsInt()
  @IsPositive()
  amount_cents?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
