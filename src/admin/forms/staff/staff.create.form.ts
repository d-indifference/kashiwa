import { UserRole } from '@prisma/client';
import { KIsEmail, KIsIn, KIsNotEmpty, KIsString, KLength } from '@library/validators';
import { Form, FormInput, FormMethods, FormPassword, FormSelect } from '@admin/lib';
import { LOCALE } from '@locale/locale';

/**
 * Body object for staff creation form
 */
@Form({ action: '/kashiwa/staff/new', method: FormMethods.POST })
export class StaffCreateForm {
  /**
   * Username
   */
  @FormInput({ type: 'text', size: 28, displayName: LOCALE.USERNAME as string })
  @KIsString('USERNAME')
  @KIsNotEmpty('USERNAME')
  @KLength('USERNAME', 3, 256)
  username: string;

  /**
   * Email
   */
  @FormInput({ type: 'email', size: 28, displayName: LOCALE.FORM_EMAIL as string })
  @KIsString('FORM_EMAIL')
  @KIsNotEmpty('FORM_EMAIL')
  @KIsEmail('FORM_EMAIL')
  @KLength('FORM_EMAIL', 3, 256)
  email: string;

  /**
   * Role
   */
  @FormSelect({
    displayName: LOCALE.ROLE as string,
    options: [
      { displayName: LOCALE.ADMINISTRATOR as string, value: UserRole.ADMINISTRATOR },
      { displayName: LOCALE.MODERATOR as string, value: UserRole.MODERATOR }
    ]
  })
  @KIsString('ROLE')
  @KIsNotEmpty('ROLE')
  @KIsIn('ROLE', [UserRole.ADMINISTRATOR, UserRole.MODERATOR])
  role: UserRole;

  /**
   * Non-hashed password
   */
  @FormPassword({ size: 28, displayName: LOCALE.FORM_PASSWORD as string })
  @KIsString('FORM_PASSWORD')
  @KIsNotEmpty('FORM_PASSWORD')
  password: string;
}
