import {
  IsUUID,
  IsEnum,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsISO8601,
  MinLength,
  MaxLength,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@cannaroute/shared';

export class OrderItemDto {
  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  dispensary_id: string;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  delivery_address_line1: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  delivery_address_line2?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  delivery_address_city: string;

  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, { message: 'delivery_address_state must be a 2-letter state code' })
  delivery_address_state: string;

  @Matches(/^\d{5}(-\d{4})?$/, { message: 'delivery_address_zip must be a valid US ZIP code' })
  delivery_address_zip: string;

  @IsEnum(['point_of_banking', 'ach', 'cash'] as PaymentMethod[])
  payment_method: PaymentMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsISO8601()
  scheduled_delivery_at?: string;
}
