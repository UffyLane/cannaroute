import {
  IsString,
  IsUUID,
  IsArray,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  product_category: string;

  @IsNumber()
  @Min(0)
  weight_grams: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  thc_percentage?: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CheckOrderDto {
  @IsUUID()
  customer_id: string;

  @IsString()
  @IsNotEmpty()
  state_code: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsUUID()
  dispensary_id: string;

  @IsOptional()
  @IsBoolean()
  is_medical?: boolean;
}
