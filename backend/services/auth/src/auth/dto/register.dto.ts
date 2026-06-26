import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
  Matches,
} from 'class-validator';
import { UserRole } from '@cannaroute/shared';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  password: string;

  @IsString()
  @MaxLength(128)
  first_name: string;

  @IsString()
  @MaxLength(128)
  last_name: string;

  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Phone must be in E.164 format (+13135550192)' })
  phone?: string;

  // Only 'customer' and 'grower' can self-register.
  // Drivers and dispensary_admins are created via invite flow.
  @IsIn(['customer', 'grower'] as UserRole[])
  role: 'customer' | 'grower';

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  state_code?: string;
}
