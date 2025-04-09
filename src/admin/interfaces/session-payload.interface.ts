import { UserRole } from '@prisma/client';

/**
 * Payload of session for authenticated user
 */
export interface ISessionPayload {
  /**
   * User's ID
   */
  id: string;

  /**
   * User's role
   */
  role: UserRole;
}
