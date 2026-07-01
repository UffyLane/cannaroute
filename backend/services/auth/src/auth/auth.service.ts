import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyAgeDto } from './dto/verify-age.dto';
import { MedicalCardDto } from './dto/medical-card.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtPayload } from '@cannaroute/shared';

// Access token: 15 minutes
const ACCESS_TOKEN_EXPIRY = '15m';
// Refresh token: 30 days
const REFRESH_TOKEN_EXPIRY = '30d';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Register ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      first_name: dto.first_name,
      last_name: dto.last_name,
      phone: dto.phone,
      role: dto.role,
      state_code: dto.state_code,
    });

    const tokens = this.generateTokens(user);

    return {
      user_id: user.id,
      email: user.email,
      role: user.role,
      ...tokens,
    };
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await this.usersService.verifyPassword(dto.password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.deleted_at) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    await this.usersService.updateLastLogin(user.id);

    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        role: user.role,
        first_name: user.first_name,
        state_code: user.state_code,
        age_verified: user.age_verified,
        is_medical: user.is_medical,
      },
    };
  }

  // ─── Refresh ──────────────────────────────────────────────────────────────

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || user.deleted_at) {
      throw new UnauthorizedException('User not found');
    }

    const access_token = this.generateAccessToken(user);
    return { access_token, expires_in: 900 };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout(_refreshToken: string): Promise<void> {
    // TODO: Add refresh token to Redis blacklist
    // Key: `blacklist:${refreshToken}`, TTL: remaining time until expiry
    // JwtStrategy checks blacklist on every request
    // For now: client-side token deletion is sufficient for Phase 1
  }

  // ─── Age Verification ─────────────────────────────────────────────────────

  async verifyAge(userId: string, dto: VerifyAgeDto) {
    // TODO: Verify the session token against Stripe Identity or Persona API
    // For Stripe Identity:
    //   const session = await stripe.identity.verificationSessions.retrieve(dto.verification_session_token);
    //   if (session.status !== 'verified') throw new UnprocessableEntityException(...)
    //   const dob = session.verified_outputs.dob; // { day, month, year }
    //
    // For now: trust the client-provided DOB (replace before production)

    const dob = new Date(dto.dob_confirmed);
    const ageMs = Date.now() - dob.getTime();
    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);

    if (ageYears < 21) {
      throw new UnprocessableEntityException({
        error: 'age_verification_failed',
        message: 'Could not confirm 21+ from provided ID',
      });
    }

    await this.usersService.setAgeVerified(userId, dob);

    return {
      age_verified: true,
      age_verified_at: new Date().toISOString(),
    };
  }

  // ─── Medical Card ─────────────────────────────────────────────────────────

  async submitMedicalCard(userId: string, dto: MedicalCardDto) {
    // TODO: Verify against state registry API
    // Michigan MMMP: GET https://michigan.gov/mmmp/registry?card_number=...
    // Response indicates active/inactive status
    //
    // For now: accept card number and mark as verified
    // Replace with real API call before launch

    const registryMatch = await this.verifyMedicalCardWithRegistry(dto);

    if (!registryMatch) {
      throw new UnprocessableEntityException({
        error: 'medical_card_not_found',
        message: `Card number not found in ${dto.state_code} medical registry`,
      });
    }

    await this.usersService.setMedicalCard(userId, {
      card_number: dto.card_number,
      card_state: dto.state_code,
      card_expiry: new Date(dto.card_expiry),
      verified: true,
    });

    return {
      medical_verified: true,
      card_expiry: dto.card_expiry,
      registry_match: true,
    };
  }

  // ─── Update Profile ───────────────────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // If password change is requested, verify current password first
    if (dto.new_password) {
      if (!dto.current_password) {
        throw new BadRequestException('current_password is required to set a new password');
      }
      const user = await this.usersService.findByEmail(
        (await this.usersService.findById(userId)).email,
      );
      const valid = user?.password_hash
        ? await this.usersService.verifyPassword(dto.current_password, user.password_hash)
        : false;
      if (!valid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
      await this.usersService.updatePassword(userId, dto.new_password);
    }

    const profileData: any = {};
    if (dto.first_name) profileData.first_name = dto.first_name;
    if (dto.last_name) profileData.last_name = dto.last_name;
    if (dto.phone) profileData.phone = dto.phone;

    if (Object.keys(profileData).length > 0) {
      return this.usersService.updateProfile(userId, profileData);
    }

    return this.usersService.findById(userId);
  }

  // ─── Token generation ─────────────────────────────────────────────────────

  private generateTokens(user: User) {
    return {
      access_token: this.generateAccessToken(user),
      refresh_token: this.generateRefreshToken(user),
      expires_in: 900, // 15 minutes in seconds
    };
  }

  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      state_code: user.state_code,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  }

  private generateRefreshToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      state_code: user.state_code,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
  }

  // ─── External API stubs ───────────────────────────────────────────────────

  private async verifyMedicalCardWithRegistry(dto: MedicalCardDto): Promise<boolean> {
    // TODO: Replace with real state registry API calls per state_code
    // Michigan: MI CRA via Accela
    // Each state has its own registry — compliance_rules.license_api_url drives the endpoint
    // For Phase 1 (Michigan only): hardcode MI MMMP registry call here
    // Return true for now (development mode)
    return true;
  }
}
