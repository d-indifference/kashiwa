import { IsIP, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeFormEmptyString } from '@admin/transforms';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

/**
 * Form with information about post deletion
 */
export class ModerationDeletePostForm {
  /**
   * Board ID
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['BOARD_ID'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['BOARD_ID'])) })
  @IsUUID('4', { message: V_LOCALE['V_UUIDV4'](vStr(LOCALE['BOARD_ID'])) })
  boardId: string;

  /**
   * Poster's IP
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['IP'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['IP'])) })
  @IsIP(undefined, { message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['IP'])) })
  ip: string;

  /**
   * Redirection string
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['REDIRECT'])) })
  @IsNotEmpty()
  redirect: string;

  /**
   * If it is !== `undefined` - post will be deleted
   */
  @Transform(normalizeFormEmptyString)
  @IsOptional()
  post?: string;

  /**
   * If it is !== `undefined` - file will be deleted
   */
  @Transform(normalizeFormEmptyString)
  @IsOptional()
  file?: string;

  /**
   * If it is !== `undefined` - all post from this IP will be deleted
   */
  @Transform(normalizeFormEmptyString)
  @IsOptional()
  allByIp?: string;
}
