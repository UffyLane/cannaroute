import { IsString, IsDateString, IsOptional, Length } from 'class-validator';

export class MedicalCardDto {
  @IsString()
  @Length(2, 2)
  state_code: string;

  @IsString()
  card_number: string;

  @IsDateString()
  card_expiry: string; // ISO date: '2025-12-31'

  // S3 key of the uploaded card photo (optional — can verify by number alone)
  @IsOptional()
  @IsString()
  card_photo_s3_key?: string;
}
