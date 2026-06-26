import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { VerifyAgeDto } from './dto/verify-age.dto';
import { MedicalCardDto } from './dto/medical-card.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Public, CurrentUser, Roles } from '@cannaroute/shared';
import { RequestUser } from '@cannaroute/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Public routes ────────────────────────────────────────────────────────

  /**
   * POST /auth/register
   * Self-registration for customers and growers.
   * Drivers and dispensary_admins are created via invite flow (not here).
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * Returns access_token (15min) + refresh_token (30d)
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/refresh
   * Exchange a valid refresh token for a new access token.
   * No auth header required — refresh token goes in the body.
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  /**
   * POST /auth/logout
   * Invalidates the refresh token (added to Redis blacklist).
   */
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refresh_token);
  }

  // ─── Authenticated routes ─────────────────────────────────────────────────

  /**
   * GET /auth/me
   * Returns the current user's profile.
   */
  @Get('me')
  getMe(@CurrentUser() user: RequestUser) {
    // UsersService.findById returns the full user — sensitive fields excluded by entity config
    return user;
  }

  /**
   * PUT /auth/me
   * Update name, phone, or password.
   */
  @Put('me')
  updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto);
  }

  /**
   * POST /auth/verify-age
   * Submit ID verification result from Stripe Identity / Persona SDK.
   * Customer only.
   */
  @Roles('customer')
  @Post('verify-age')
  @HttpCode(HttpStatus.OK)
  verifyAge(@CurrentUser() user: RequestUser, @Body() dto: VerifyAgeDto) {
    return this.authService.verifyAge(user.id, dto);
  }

  /**
   * POST /auth/medical-card
   * Submit medical patient card for verification against state registry.
   * Customer only.
   */
  @Roles('customer')
  @Post('medical-card')
  @HttpCode(HttpStatus.OK)
  submitMedicalCard(@CurrentUser() user: RequestUser, @Body() dto: MedicalCardDto) {
    return this.authService.submitMedicalCard(user.id, dto);
  }
}
