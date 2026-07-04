import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';

export class CreateGrowerDto {
  @IsString()
  @IsNotEmpty()
  farm_name: string;

  @IsOptional()
  @IsString()
  farm_description?: string;

  @IsString()
  @IsNotEmpty()
  license_number: string;

  @IsString()
  @Length(2, 2)
  state_code: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  county?: string;

  // ─── Certifications ────────────────────────────────────────────────────────

  @IsOptional()
  @IsBoolean()
  clean_green_certified?: boolean;

  @IsOptional()
  @IsString()
  clean_green_cert_number?: string;

  @IsOptional()
  @IsBoolean()
  sun_earth_certified?: boolean;

  @IsOptional()
  @IsString()
  sun_earth_cert_number?: string;

  @IsOptional()
  @IsBoolean()
  usda_organic?: boolean;

  // ─── Growing practices ─────────────────────────────────────────────────────

  @IsOptional()
  @IsBoolean()
  no_pesticides_used?: boolean;

  @IsOptional()
  @IsBoolean()
  outdoor_grown?: boolean;

  @IsOptional()
  @IsBoolean()
  indoor_grown?: boolean;

  @IsOptional()
  @IsBoolean()
  greenhouse_grown?: boolean;

  // ─── License expiry ────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'license_expiry_date must be YYYY-MM-DD' })
  license_expiry_date?: string;
}
