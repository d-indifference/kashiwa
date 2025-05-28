/**
 * Form for user's posts deletions
 */
import { normalizeBooleanCheckbox, normalizeStringArray } from '@admin/transforms';
import { Transform } from 'class-transformer';
import { KIsArray, KIsBoolean, KIsNotEmpty, KIsNumberString, KIsString, KLength } from '@library/validators';

export class PostsDeleteForm {
  /**
   * List of numbers of posts for deletions
   */
  @Transform(normalizeStringArray)
  @KIsArray('USER_DELETE_DELETE_POST')
  @KIsNumberString('USER_DELETE_DELETE_POST', undefined, { each: true })
  delete: string[];

  /**
   * If it is `true`, only files will be removed
   */
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('USER_DELETE_ONLY_FILE')
  @KIsNotEmpty('USER_DELETE_ONLY_FILE')
  fileOnly: boolean = false;

  /**
   * Poster's password
   */
  @KIsString('FORM_PASSWORD')
  @KIsNotEmpty('FORM_PASSWORD')
  @KLength('FORM_PASSWORD', 8, 8)
  password: string;
}
