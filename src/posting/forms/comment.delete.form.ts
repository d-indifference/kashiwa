import { Transform } from 'class-transformer';
import { KIsArray, KIsBigint, KIsBoolean, KIsNotEmpty, KIsString, KLength } from '@library/validators';
import { normalizeBigintArray, normalizeBooleanCheckbox } from '@library/transforms';

/**
 * Form for user's comment deletion
 */
export class CommentDeleteForm {
  /**
   * List of numbers of posts for deletions
   */
  @Transform(normalizeBigintArray)
  @KIsArray('USER_DELETE_DELETE_POST')
  @KIsBigint('USER_DELETE_DELETE_POST', { each: true })
  delete: bigint[];

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
