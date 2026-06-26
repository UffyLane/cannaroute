import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../types';

/**
 * @CurrentUser()
 * Pulls the authenticated user off the request object.
 * JwtAuthGuard must run first — it populates req.user from the JWT payload.
 *
 * Usage:
 *   @Get('me')
 *   getProfile(@CurrentUser() user: RequestUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
