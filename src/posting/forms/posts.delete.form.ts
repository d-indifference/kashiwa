/**
 * Form for user's posts deletions
 */
import { IsArray, IsBoolean, IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';
import { normalizeBooleanCheckbox, normalizeStringArray } from '@admin/transforms';
import { Transform } from 'class-transformer';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

export class PostsDeleteForm {
  /**
   * List of numbers of posts for deletions
   */
  @Transform(normalizeStringArray)
  @IsArray({ message: V_LOCALE['V_ARRAY'](vStr(LOCALE['USER_DELETE_DELETE_POST'])) })
  @IsNumberString(undefined, { each: true, message: V_LOCALE['V_NUMBER_STRING'](vStr('USER_DELETE_DELETE_POST')) })
  delete: string[];

  /**
   * If it is `true`, only files will be removed
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean({ message: V_LOCALE['V_BOOLEAN'](vStr(LOCALE['USER_DELETE_ONLY_FILE'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['USER_DELETE_ONLY_FILE'])) })
  fileOnly: boolean = false;

  /**
   * Poster's password
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_PASSWORD'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['FORM_PASSWORD'])) })
  @Length(8, 8, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE['FORM_PASSWORD']), vStr(8), vStr(8)) })
  password: string;
}
