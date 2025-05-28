import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeFormEmptyString } from '@admin/transforms';
import { KIsIp, KIsNotEmpty, KIsString, KIsUUIDv4 } from '@library/validators';

/**
 * Form with information about post deletion
 */
export class ModerationDeletePostForm {
  /**
   * Board ID
   */
  @KIsString('BOARD_ID')
  @KIsNotEmpty('BOARD_ID')
  @KIsUUIDv4('BOARD_ID')
  boardId: string;

  /**
   * Poster's IP
   */
  @KIsString('IP')
  @KIsNotEmpty('IP')
  @KIsIp('IP')
  ip: string;

  /**
   * Redirection string
   */
  @KIsString('REDIRECT')
  @KIsNotEmpty('REDIRECT')
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
