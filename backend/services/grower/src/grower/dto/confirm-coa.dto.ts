import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsIn,
  Matches,
} from 'class-validator';

/**
 * ConfirmCoaDto — grower reviews and optionally corrects OCR-parsed
 * COA data before confirming the lab test as accurate.
 *
 * Only fields the grower is allowed to correct are included here.
 * System fields (parse_confidence, raw_parsed_data, status) are
 * set by the service, not accepted from the client.
 */
export class ConfirmCoaDto {
  @IsOptional()
  @IsString()
  lab_name?: string;

  @IsOptional()
  @IsString()
  lab_license_number?: string;

  // ─── Cannabinoids ──────────────────────────────────────────────────────────

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  thc_percentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  thca_percentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cbd_percentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cbda_percentage?: number;

  // ─── Safety panels ─────────────────────────────────────────────────────────

  @IsOptional()
  @IsIn(['pass', 'fail', 'not_tested'])
  pesticide_panel?: string;

  @IsOptional()
  @IsIn(['pass', 'fail', 'not_tested'])
  heavy_metals_panel?: string;

  @IsOptional()
  @IsIn(['pass', 'fail', 'not_tested'])
  microbials_panel?: string;

  @IsOptional()
  @IsIn(['pass', 'fail', 'not_tested'])
  mycotoxins_panel?: string;

  @IsOptional()
  @IsIn(['pass', 'fail', 'not_tested'])
  residual_solvents_panel?: string;

  @IsOptional()
  @IsBoolean()
  overall_pass?: boolean;

  // ─── Dates ─────────────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'tested_at must be YYYY-MM-DD' })
  tested_at?: string;
}
