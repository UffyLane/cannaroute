import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../guards/jwt-auth.guard';

/**
 * @Public()
 * Mark a route handler as publicly accessible — JwtAuthGuard will skip it.
 * Use on: POST /auth/login, POST /auth/register, POST /auth/refresh
 *
 * Usage:
 *   @Public()
 *   @Post('login')
 *   login(@Body() dto: LoginDto) { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
