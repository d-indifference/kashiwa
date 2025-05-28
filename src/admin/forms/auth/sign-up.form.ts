import { KIsEmail, KIsNotEmpty, KIsString, KLength } from '@library/validators';

/**
 * Body object for sign up form
 */
export class SignUpForm {
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
   * Password
   */
  @KIsString('FORM_PASSWORD')
  @KIsNotEmpty('FORM_PASSWORD')
  password: string;
}
