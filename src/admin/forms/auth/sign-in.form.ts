import { IsNotEmpty, IsString, Length } from 'class-validator';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

/**
 * Body object for sign in form
 */
export class SignInForm {
  /**
   * Username
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['USERNAME'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['USERNAME'])) })
  @Length(3, 256, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE['USERNAME']), vStr(3), vStr(256)) })
  username: string;

  /**
   * Password
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_PASSWORD'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['FORM_PASSWORD'])) })
  password: string;
}
