/**
 * Form for user's posts deletions
 */
import { IsArray, IsBoolean, IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';
import { normalizeBooleanCheckbox, normalizeStringArray } from '@admin/transforms';
import { Transform } from 'class-transformer';

export class PostsDeleteForm {
  /**
   * List of numbers of posts for deletions
   */
  @Transform(normalizeStringArray)
  @IsArray()
  @IsNumberString(undefined, { each: true })
  delete: string[];

  /**
   * If it is `true`, only files will be removed
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  fileOnly: boolean = false;

  /**
   * Poster's password
   */
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  password: string;
}
