import { IsInt, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStockDto {
  // Positive = restock, negative = manual adjustment, zero = set to zero
  @IsInt()
  quantity_delta: number;

  @IsEnum(['restock', 'sale', 'adjustment', 'return', 'loss'])
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
