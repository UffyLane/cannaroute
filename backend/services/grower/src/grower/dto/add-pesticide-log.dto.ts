import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  Matches,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

/**
 * AddPesticideLogDto — grower submits a pesticide application record.
 *
 * Two mutually exclusive paths:
 *  1. no_pesticides_used: true → self-certify clean grow (no other fields required)
 *  2. pesticide_name required → product application (epa_reg_number triggers EPA API check)
 */
export class AddPesticideLogDto {
  @IsOptional()
  @IsUUID()
  product_id?: string;

  // ─── Path 1: No pesticides ─────────────────────────────────────────────────

  @IsOptional()
  @IsBoolean()
  no_pesticides_used?: boolean;

  // ─── Path 2: Pesticide application ────────────────────────────────────────

  @ValidateIf((o) => !o.no_pesticides_used)
  @IsString()
  @IsNotEmpty()
  pesticide_name?: string;

  @IsOptional()
  @IsString()
  active_ingredient?: string;

  // Format: XXXXX-XXXXX
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-\d{5}$/, { message: 'epa_reg_number must be in format XXXXX-XXXXX' })
  epa_reg_number?: string;

  @IsOptional()
  @IsString()
  application_method?: string;

  @IsOptional()
  @IsString()
  application_rate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'applied_date must be YYYY-MM-DD' })
  applied_date?: string;

  @IsOptional()
  @IsString()
  pre_harvest_interval_days?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
