import { KIsNotEmpty, KIsString, KLength } from '@library/validators';

/**
 * Body object for sign in form
 */
export class SignInForm {
  /**
   * Username
   */
  @KIsString('USERNAME')
  @KIsNotEmpty('USERNAME')
  @KLength('USERNAME', 3, 256)
  username: string;

  /**
   * Password
   */
  @KIsString('FORM_PASSWORD')
  @KIsNotEmpty('FORM_PASSWORD')
  password: string;
}
