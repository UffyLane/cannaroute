import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateGpsDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  // GPS accuracy from device — stored for data quality assessment
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy_meters?: number;
}
