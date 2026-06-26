import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types';

export const ROLES_KEY = 'roles';

/**
 * @Roles('dispensary_admin', 'platform_admin')
 * Attach to a controller or route handler. RolesGuard reads this metadata
 * and compares against the JWT role claim.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
