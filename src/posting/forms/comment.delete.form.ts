import { Transform } from 'class-transformer';
import { KIsArray, KIsBigint, KIsBoolean, KIsIn, KIsNotEmpty, KIsString, KLength } from '@library/validators';
import { normalizeBigintArray, normalizeBooleanCheckbox } from '@library/transforms';
import { LOCALE } from '@locale/locale';

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

  /**
   * Comment deletion submit type
   * - `Delete`: comment or file will be deleted
   * - `Report`: comment or file will be reported to the administration
   */
  @KIsString('COMMENT_DELETION_SUBMIT_TYPE')
  @KIsNotEmpty('COMMENT_DELETION_SUBMIT_TYPE')
  @KIsIn('COMMENT_DELETION_SUBMIT_TYPE', [LOCALE.DELETE, LOCALE.REPORT])
  submitType: string;
}
