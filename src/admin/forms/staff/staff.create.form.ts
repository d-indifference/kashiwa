import { IsEmail, IsIn, IsNotEmpty, IsString, Length } from 'class-validator';
import { UserRole } from '@prisma/client';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

/**
 * Body object for staff creation form
 */
export class StaffCreateForm {
  /**
   * Username
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['USERNAME'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['USERNAME'])) })
  @Length(3, 256, { message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['USERNAME']), vStr(3), vStr(256)) })
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
   * Role
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['ROLE'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['ROLE'])) })
  @IsIn([UserRole.ADMINISTRATOR, UserRole.MODERATOR], {
    message: V_LOCALE['V_IN'](vStr(LOCALE['ROLE']), [UserRole.ADMINISTRATOR, UserRole.MODERATOR])
  })
  role: UserRole;

  /**
   * Non-hashed password
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_PASSWORD'])) })
  @IsNotEmpty()
  password: string;
}
