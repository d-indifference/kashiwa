import { IsIP, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeFormEmptyString } from '@admin/transforms';

/**
 * Form with information about post deletion
 */
export class ModerationDeletePostForm {
  /**
   * Board ID
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  boardId: string;

  /**
   * Poster's IP
   */
  @IsString()
  @IsNotEmpty()
  @IsIP()
  ip: string;

  /**
   * Redirection string
   */
  @IsString()
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
