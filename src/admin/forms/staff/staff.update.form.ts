import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { UserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { emptyFormText } from '@admin/transforms';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

/**
 * Body object for staff updating form
 */
export class StaffUpdateForm {
  /**
   * Update candidate object ID (strictly required)
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['ID'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['ID'])) })
  @IsUUID('4', { message: V_LOCALE['V_UUIDV4'](vStr(LOCALE['ID'])) })
  id: string;

  /**
   * Username
   */
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['USERNAME'])) })
  @Length(3, 256, { message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['USERNAME']), vStr(3), vStr(256)) })
  @Transform(emptyFormText)
  username?: string;

  /**
   * Email
   */
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_EMAIL'])) })
  @IsEmail(undefined, { message: V_LOCALE['V_EMAIL'](vStr(LOCALE['FORM_EMAIL'])) })
  @Length(3, 256, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE['FORM_EMAIL']), vStr(3), vStr(256)) })
  @Transform(emptyFormText)
  email?: string;

  /**
   * Role
   */
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['ROLE'])) })
  @IsIn([UserRole.ADMINISTRATOR, UserRole.MODERATOR], {
    message: V_LOCALE['V_IN'](vStr(LOCALE['ROLE']), [UserRole.ADMINISTRATOR, UserRole.MODERATOR])
  })
  role?: UserRole;

  /**
   * Non-hashed password
   */
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_PASSWORD'])) })
  @Transform(emptyFormText)
  password?: string;
}
