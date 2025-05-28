import { UserRole } from '@prisma/client';
import { KIsEmail, KIsIn, KIsNotEmpty, KIsString, KLength } from '@library/validators';

/**
 * Body object for staff creation form
 */
export class StaffCreateForm {
  /**
   * Username
   */
  @KIsString('USERNAME')
  @KIsNotEmpty('USERNAME')
  @KLength('USERNAME', 3, 256)
  username: string;

  /**
   * Email
   */
  @KIsString('FORM_EMAIL')
  @KIsNotEmpty('FORM_EMAIL')
  @KIsEmail('FORM_EMAIL')
  @KLength('FORM_EMAIL', 3, 256)
  email: string;

  /**
   * Role
   */
  @KIsString('ROLE')
  @KIsNotEmpty('ROLE')
  @KIsIn('ROLE', [UserRole.ADMINISTRATOR, UserRole.MODERATOR])
  role: UserRole;

  /**
   * Non-hashed password
   */
  @KIsString('FORM_PASSWORD')
  @KIsNotEmpty('FORM_PASSWORD')
  password: string;
}
