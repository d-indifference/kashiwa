import { LOCALE } from '@locale/locale';
import { KIsNotEmpty, KIsString, KLength } from '@library/validators';
import { Form, FormInput, FormMethods, FormPassword } from '@admin/lib';

/**
 * Body object for sign in form
 */
@Form({ method: FormMethods.POST, action: '/kashiwa/auth/sign-in' })
export class AuthSignInForm {
  /**
   * Username
   */
  @FormInput({ type: 'text', size: 28, displayName: LOCALE.USERNAME as string })
  @KIsString('USERNAME')
  @KIsNotEmpty('USERNAME')
  @KLength('USERNAME', 3, 256)
  username: string;

  /**
   * Password
   */
  @FormPassword({ size: 28, displayName: LOCALE.FORM_PASSWORD as string })
  @KIsString('FORM_PASSWORD')
  @KIsNotEmpty('FORM_PASSWORD')
  password: string;

  /**
   * @param username Username
   * @param password Password
   */
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}
