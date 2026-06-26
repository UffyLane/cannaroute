import {
  IsString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsUUID()
  dispensary_id: string;

  @IsOptional()
  @IsUUID()
  grower_id?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(['flower', 'concentrate', 'edible', 'tincture', 'topical', 'preroll'])
  category: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  strain: string;

  @IsEnum(['indica', 'sativa', 'hybrid', 'cbd', 'na'])
  strain_type: string;

  // Price in cents — frontend sends 4500 for $45.00
  @IsInt()
  @Min(1)
  price_cents: number;

  // Weight of a single unit in grams
  @IsNumber()
  @Min(0.001)
  weight_grams: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  thc_percentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cbd_percentage?: number;

  @IsInt()
  @Min(0)
  stock_quantity: number;

  @IsOptional()
  @IsString()
  metrc_package_tag?: string;
}
