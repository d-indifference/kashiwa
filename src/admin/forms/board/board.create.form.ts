import { FileAttachmentMode } from '@prisma/client';
import { Transform } from 'class-transformer';
import { normalizeBooleanCheckbox, normalizeNumber, normalizeStringArray } from '@admin/transforms';
import { Constants } from '@library/constants';
import {
  KCustomBoardMatches,
  KIsArray,
  KIsBoolean,
  KIsIn,
  KIsNotEmpty,
  KIsNumber,
  KIsPositive,
  KIsString,
  KLength,
  KMax,
  KMin
} from '@library/validators';

const fileAttachmentModes = [FileAttachmentMode.STRICT, FileAttachmentMode.FORBIDDEN, FileAttachmentMode.OPTIONAL];

/**
 * Form object for creation of new board
 */
export class BoardCreateForm {
  /**
   * Board URL path
   */
  @KIsString('URL')
  @KIsNotEmpty('URL')
  @KLength('URL', 1, 64)
  @KCustomBoardMatches('URL')
  url: string;

  /**
   * Board Name
   */
  @KIsString('NAME')
  @KIsNotEmpty('NAME')
  @KLength('NAME', 2, 256)
  name: string;

  /**
   * Is posting enabled?
   */
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('ALLOW_POSTING')
  @KIsNotEmpty('ALLOW_POSTING')
  allowPosting: boolean = false;

  /**
   * Disable Name & Email fields
   */
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('STRICT_ANONYMITY')
  @KIsNotEmpty('STRICT_ANONYMITY')
  strictAnonymity: boolean = false;

  /**
   * Thread file attachment policy
   * `STRICT` - File is strictly required
   * `OPTIONAL` - File attachment is optional
   * `FORBIDDEN` - Files are strictly prohibited
   */
  @KIsString('THREAD_FILE_POLICY')
  @KIsNotEmpty('THREAD_FILE_POLICY')
  @KIsIn('THREAD_FILE_POLICY', fileAttachmentModes)
  threadFileAttachmentMode: FileAttachmentMode;

  /**
   * Reply file attachment policy <br>
   * `STRICT` - File is strictly required <br>
   * `OPTIONAL` - File attachment is optional <br>
   * `FORBIDDEN` - Files are strictly prohibited
   */
  @KIsString('REPLY_FILE_POLICY')
  @KIsNotEmpty('REPLY_FILE_POLICY')
  @KIsIn('REPLY_FILE_POLICY', fileAttachmentModes)
  replyFileAttachmentMode: FileAttachmentMode;

  /**
   * Delay between threads creations (seconds)
   */
  @Transform(normalizeNumber)
  @KIsNumber('DELAY_AFTER_THREAD')
  @KIsNotEmpty('DELAY_AFTER_THREAD')
  @KIsPositive('DELAY_AFTER_THREAD')
  delayAfterThread: number;

  /**
   * Delay between replies creations (seconds)
   */
  @Transform(normalizeNumber)
  @KIsNumber('DELAY_AFTER_REPLY')
  @KIsNotEmpty('DELAY_AFTER_REPLY')
  @KIsPositive('DELAY_AFTER_REPLY')
  delayAfterReply: number;

  /**
   * Minimal uploaded file size (bytes)
   */
  @Transform(normalizeNumber)
  @KIsNumber('MIN_FILE_SIZE')
  @KIsNotEmpty('MIN_FILE_SIZE')
  @KIsPositive('MIN_FILE_SIZE')
  minFileSize: number;

  /**
   * Maximal uploaded file size (bytes)
   */
  @Transform(normalizeNumber)
  @KIsNumber('MAX_FILE_SIZE')
  @KIsNotEmpty('MAX_FILE_SIZE')
  @KIsPositive('MAX_FILE_SIZE')
  maxFileSize: number;

  /**
   * Allow wakaba markdown.<br>
   * `true` - full wakaba markdown opportunities are enabled <br>
   * `false` - only replies (`>>123`), citations (`> test`) and links will be formated. <br>
   */
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('ALLOW_MARKDOWN')
  @KIsNotEmpty('ALLOW_MARKDOWN')
  allowMarkdown: boolean = false;

  /**
   * Allow tripcode parsing
   */
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('ALLOW_TRIPCODES')
  @KIsNotEmpty('ALLOW_TRIPCODES')
  allowTripcodes: boolean = false;

  /**
   * Maximum number of threads that can be on the board at the same time
   */
  @Transform(normalizeNumber)
  @KIsNumber('MAX_THREADS_ON_BOARD')
  @KIsNotEmpty('MAX_THREADS_ON_BOARD')
  @KIsPositive('MAX_THREADS_ON_BOARD')
  maxThreadsOnBoard: number;

  /**
   * Number of posts after which the thread will not rise
   */
  @Transform(normalizeNumber)
  @KIsNumber('BUMP_LIMIT')
  @KIsNotEmpty('BUMP_LIMIT')
  @KIsPositive('BUMP_LIMIT')
  bumpLimit: number;

  /**
   * Maximal size of Name, Email and subject fields
   */
  @Transform(normalizeNumber)
  @KIsNumber('MAX_STRING_FIELD_SIZE')
  @KIsNotEmpty('MAX_STRING_FIELD_SIZE')
  @KMin('MAX_STRING_FIELD_SIZE', 0)
  @KMax('MAX_STRING_FIELD_SIZE', 256)
  maxStringFieldSize: number;

  /**
   * Maximal size of Comment field
   */
  @Transform(normalizeNumber)
  @KIsNumber('MAX_COMMENT_SIZE')
  @KIsNotEmpty('MAX_COMMENT_SIZE')
  @KIsPositive('MAX_COMMENT_SIZE')
  maxCommentSize: number;

  /**
   * Default poster name
   */
  @KIsString('DEFAULT_POSTER_NAME')
  @KIsNotEmpty('DEFAULT_POSTER_NAME')
  @KLength('DEFAULT_POSTER_NAME', 1, 256)
  defaultPosterName: string;

  /**
   * Default moderator name
   */
  @KIsString('DEFAULT_MODERATOR_NAME')
  @KIsNotEmpty('DEFAULT_MODERATOR_NAME')
  @KLength('DEFAULT_MODERATOR_NAME', 1, 256)
  defaultModeratorName: string;

  /**
   * Enable captcha
   */
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('ENABLE_CAPTCHA')
  @KIsNotEmpty('ENABLE_CAPTCHA')
  enableCaptcha: boolean = false;

  /**
   * Set case sensitivity for captcha
   */
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('IS_CAPTCHA_CASE_SENSITIVE')
  @KIsNotEmpty('IS_CAPTCHA_CASE_SENSITIVE')
  isCaptchaCaseSensitive: boolean = false;

  /**
   * List of supported file types for current board (MIME)
   */
  @Transform(normalizeStringArray)
  @KIsArray('ALLOWED_FILE_TYPES')
  @KIsIn('ALLOWED_FILE_TYPES', Constants.SUPPORTED_FILE_TYPES, { each: true })
  allowedFileTypes: string[] = [];

  /**
   * HTML fragment with board rules
   */
  @KIsString('RULES')
  @KIsNotEmpty('RULES')
  rules: string;
}
