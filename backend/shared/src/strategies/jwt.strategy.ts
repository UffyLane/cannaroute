import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, RequestUser } from '../types';

/**
 * JwtStrategy (stateless microservice edition)
 *
 * Used by every service EXCEPT auth service.
 *
 * The auth service has its own JwtStrategy that does a DB lookup to confirm
 * the user still exists and isn't deleted. That's appropriate for the service
 * that manages identity.
 *
 * Every other service validates the JWT signature and trusts the claims.
 * No DB call, no latency. The auth service is the gatekeeper — if a token
 * was issued by auth, the claim is valid. Token revocation is handled via
 * short expiry (15 min access token) + Redis blacklist on logout (Phase 2).
 *
 * Register this in any service's AppModule providers array:
 *   providers: [JwtStrategy, ...]
 *
 * The service must also have PassportModule and JwtModule imported for this to work.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Called after the JWT signature is verified.
   * Return value becomes req.user in controllers.
   * No DB call — we trust the claims in a valid, signed token.
   */
  async validate(payload: JwtPayload): Promise<RequestUser> {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      state_code: payload.state_code,
    };
  }
}
