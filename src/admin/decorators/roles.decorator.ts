import { SetMetadata } from '@nestjs/common';

/**
 * Decorator for URL role policy
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
