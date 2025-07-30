import { Form, FormInput, FormPassword, FormMethods } from '@admin/lib';
import { LOCALE } from '@locale/locale';
import { KIsEmail, KIsNotEmpty, KIsString, KLength } from '@library/validators';

/**
 * Body object for sign up form
 */
@Form({ method: FormMethods.POST, action: '/kashiwa/auth/sign-up' })
export class AuthSignUpForm {
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
   * Password
   */
  @FormPassword({ size: 28, displayName: LOCALE.FORM_PASSWORD as string })
  @KIsString('FORM_PASSWORD')
  @KIsNotEmpty('FORM_PASSWORD')
  password: string;
}
