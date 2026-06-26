import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, RequestUser } from '@cannaroute/shared';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      // Extract JWT from Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Called automatically by Passport after the token signature is verified.
   * Whatever we return here becomes req.user in controllers.
   * We keep it lightweight — just what controllers need for auth decisions.
   * Avoid a DB hit here to keep latency low on every authenticated request.
   */
  async validate(payload: JwtPayload): Promise<RequestUser> {
    // Validate the user still exists and isn't soft-deleted
    // In production you'd cache this in Redis with a short TTL
    const user = await this.usersService.findById(payload.sub).catch(() => null);
    if (!user || user.deleted_at) {
      throw new UnauthorizedException('User account not found or deactivated');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      state_code: payload.state_code,
    };
  }
}
