import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

/**
 * Body object for sign up form
 */
export class SignUpForm {
  /**
   * Username
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['USERNAME'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['USERNAME'])) })
  @Length(3, 256, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE['USERNAME']), vStr(3), vStr(256)) })
  username: string;

  /**
   * Email
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_EMAIL'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['FORM_EMAIL'])) })
  @IsEmail(undefined, { message: V_LOCALE['V_EMAIL'](vStr(LOCALE['FORM_EMAIL'])) })
  @Length(3, 256, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE['FORM_EMAIL']), vStr(3), vStr(256)) })
  email: string;

  /**
   * Password
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_PASSWORD'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['FORM_PASSWORD'])) })
  password: string;
}
