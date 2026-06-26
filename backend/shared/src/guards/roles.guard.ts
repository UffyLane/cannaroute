import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole, RequestUser } from '../types';

/**
 * RolesGuard
 * Reads @Roles() metadata and compares against the authenticated user's role.
 * Must run AFTER JwtAuthGuard (req.user must already be populated).
 *
 * Applied globally in each service's AppModule alongside JwtAuthGuard.
 * If no @Roles() decorator is present, the route is accessible by any authenticated user.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator — any authenticated user can access
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    if (!user) {
      throw new ForbiddenException('No authenticated user on request');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Role '${user.role}' is not authorized. Required: ${requiredRoles.join(' | ')}`,
      );
    }

    return true;
  }
}
