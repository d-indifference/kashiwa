import {
  Form,
  FormCheckbox,
  FormCheckboxList,
  FormCheckboxListOptionOptions,
  FormHidden,
  FormInput,
  FormMethods,
  FormSelect,
  FormTextarea
} from '@admin/lib';
import { LOCALE } from '@locale/locale';
import { FileAttachmentMode } from '@prisma/client';
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
  KIsUUIDv4,
  KLength,
  KMax,
  KMin
} from '@library/validators';
import { IsOptional } from 'class-validator';
import { normalizeBooleanCheckbox, normalizeNumber, normalizeStringArray } from '@library/transforms';
import { Transform } from 'class-transformer';

const fileAttachmentModes = [FileAttachmentMode.STRICT, FileAttachmentMode.FORBIDDEN, FileAttachmentMode.OPTIONAL];

const allowedFileTypes: FormCheckboxListOptionOptions[] = Constants.SUPPORTED_FILE_TYPES.map(fileType => ({
  value: fileType,
  name: 'allowedFileType',
  displayName: fileType
}));

/**
 * Form object for updating of new board
 */
@Form({ action: '/kashiwa/board/edit', method: FormMethods.POST })
export class BoardUpdateForm {
  /**
   * Update candidate object ID (strictly required)
   */
  @FormHidden()
  @KIsString('ID')
  @KIsNotEmpty('ID')
  @KIsUUIDv4('ID')
  id: string;

  /**
   * Board URL path
   */
  @FormInput({ type: 'text', displayName: LOCALE.URL as string, size: 28 })
  @IsOptional()
  @KIsString('URL')
  @KLength('URL', 1, 64)
  @KCustomBoardMatches('URL')
  url: string;

  /**
   * Board Name
   */
  @FormInput({ type: 'text', displayName: LOCALE.NAME as string, size: 28 })
  @IsOptional()
  @KIsString('NAME')
  @KLength('NAME', 2, 256)
  name: string;

  /**
   * Is posting enabled
   */
  @FormCheckbox({ displayName: LOCALE.ALLOW_POSTING as string })
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('ALLOW_POSTING')
  allowPosting: boolean = false;

  /**
   * Disable Name & Email fields
   */
  @FormCheckbox({
    displayName: `<abbr title="${LOCALE.STRICT_ANONYMITY_ABBR as string}">${LOCALE.STRICT_ANONYMITY as string}</abbr>`
  })
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('STRICT_ANONYMITY')
  strictAnonymity: boolean = false;

  /**
   * Thread file attachment policy
   * `STRICT` - File is strictly required
   * `OPTIONAL` - File attachment is optional
   * `FORBIDDEN` - Files are strictly prohibited
   */
  @FormSelect({
    displayName: LOCALE.THREAD_FILE_POLICY as string,
    options: [
      { displayName: LOCALE.FILE_POLICY_STRICT as string, value: FileAttachmentMode.STRICT },
      { displayName: LOCALE.FILE_POLICY_OPTIONAL as string, value: FileAttachmentMode.OPTIONAL },
      { displayName: LOCALE.FILE_POLICY_FORBIDDEN as string, value: FileAttachmentMode.FORBIDDEN }
    ]
  })
  @IsOptional()
  @KIsString('THREAD_FILE_POLICY')
  @KIsIn('THREAD_FILE_POLICY', fileAttachmentModes)
  threadFileAttachmentMode: FileAttachmentMode;

  /**
   * Reply file attachment policy <br>
   * `STRICT` - File is strictly required <br>
   * `OPTIONAL` - File attachment is optional <br>
   * `FORBIDDEN` - Files are strictly prohibited
   */
  @FormSelect({
    displayName: LOCALE.REPLY_FILE_POLICY as string,
    options: [
      { displayName: LOCALE.FILE_POLICY_STRICT as string, value: FileAttachmentMode.STRICT },
      { displayName: LOCALE.FILE_POLICY_OPTIONAL as string, value: FileAttachmentMode.OPTIONAL },
      { displayName: LOCALE.FILE_POLICY_FORBIDDEN as string, value: FileAttachmentMode.FORBIDDEN }
    ]
  })
  @IsOptional()
  @KIsString('REPLY_FILE_POLICY')
  @KIsIn('REPLY_FILE_POLICY', fileAttachmentModes)
  replyFileAttachmentMode: FileAttachmentMode;

  /**
   * Delay between threads creations (seconds)
   */
  @FormInput({
    type: 'number',
    displayName: `${LOCALE.DELAY_AFTER_THREAD as string} (${LOCALE.SECONDS as string})`
  })
  @IsOptional()
  @Transform(normalizeNumber)
  @KIsNumber('DELAY_AFTER_THREAD')
  @KIsPositive('DELAY_AFTER_THREAD')
  delayAfterThread: number;

  /**
   * Delay between replies creations (seconds)
   */
  @FormInput({
    type: 'number',
    displayName: `${LOCALE.DELAY_AFTER_REPLY as string} (${LOCALE.SECONDS as string})`
  })
  @IsOptional()
  @Transform(normalizeNumber)
  @KIsNumber('DELAY_AFTER_REPLY')
  @KIsPositive('DELAY_AFTER_REPLY')
  delayAfterReply: number;

  /**
   * Minimal uploaded file size (bytes)
   */
  @FormInput({
    type: 'number',
    displayName: `${LOCALE.MIN_FILE_SIZE as string} (${LOCALE.BYTES as string})`
  })
  @IsOptional()
  @Transform(normalizeNumber)
  @KIsNumber('MIN_FILE_SIZE')
  @KIsPositive('MIN_FILE_SIZE')
  minFileSize: number;

  /**
   * Maximal uploaded file size (bytes)
   */
  @FormInput({
    type: 'number',
    displayName: `${LOCALE.MAX_FILE_SIZE as string} (${LOCALE.BYTES as string})`
  })
  @IsOptional()
  @Transform(normalizeNumber)
  @KIsNumber('MAX_FILE_SIZE')
  @KIsPositive('MAX_FILE_SIZE')
  maxFileSize: number;

  /**
   * Allow wakaba markdown.<br>
   * `true` - full wakaba markdown opportunities are enabled <br>
   * `false` - only replies (`>>123`), citations (`> test`) and links will be formated. <br>
   */
  @FormCheckbox({
    displayName: `<abbr title="${LOCALE.ALLOW_MARKDOWN_ABBR as string}">${LOCALE.ALLOW_MARKDOWN as string}</abbr>`
  })
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('ALLOW_MARKDOWN')
  allowMarkdown: boolean = false;

  /**
   * Allow tripcode parsing
   */
  @FormCheckbox({ displayName: LOCALE.ALLOW_TRIPCODES as string })
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('ALLOW_TRIPCODES')
  allowTripcodes: boolean = false;

  /**
   * The maximum number of threads that can be on the board at the same time
   */
  @FormInput({
    type: 'number',
    displayName: LOCALE.MAX_THREADS_ON_BOARD as string
  })
  @IsOptional()
  @Transform(normalizeNumber)
  @KIsNumber('MAX_THREADS_ON_BOARD')
  @KIsPositive('MAX_THREADS_ON_BOARD')
  maxThreadsOnBoard: number;

  /**
   * Number of posts after which the thread will not rise
   */
  @FormInput({
    type: 'number',
    displayName: LOCALE.BUMP_LIMIT as string
  })
  @IsOptional()
  @Transform(normalizeNumber)
  @KIsNumber('BUMP_LIMIT')
  @KIsPositive('BUMP_LIMIT')
  bumpLimit: number;

  /**
   * Maximal size of Name, Email and subject fields
   */
  @FormInput({
    type: 'number',
    displayName: `<abbr title="${LOCALE.MAX_STRING_FIELD_SIZE_ABBR as string}">${LOCALE.MAX_STRING_FIELD_SIZE as string}</abbr>`
  })
  @IsOptional()
  @Transform(normalizeNumber)
  @KIsNumber('MAX_STRING_FIELD_SIZE')
  @KMin('MAX_STRING_FIELD_SIZE', 0)
  @KMax('MAX_STRING_FIELD_SIZE', 256)
  maxStringFieldSize: number;

  /**
   * Maximal size of Comment field
   */
  @FormInput({
    type: 'number',
    displayName: LOCALE.MAX_COMMENT_SIZE as string
  })
  @IsOptional()
  @Transform(normalizeNumber)
  @KIsNumber('MAX_COMMENT_SIZE')
  @KIsPositive('MAX_COMMENT_SIZE')
  maxCommentSize: number;

  /**
   * Default poster name
   */
  @FormInput({ type: 'text', displayName: LOCALE.DEFAULT_POSTER_NAME as string, size: 28 })
  @IsOptional()
  @KIsString('DEFAULT_POSTER_NAME')
  @KLength('DEFAULT_POSTER_NAME', 1, 256)
  defaultPosterName: string;

  /**
   * Default moderator name
   */
  @FormInput({ type: 'text', displayName: LOCALE.DEFAULT_MODERATOR_NAME as string, size: 28 })
  @IsOptional()
  @KIsString('DEFAULT_MODERATOR_NAME')
  @KLength('DEFAULT_MODERATOR_NAME', 1, 256)
  defaultModeratorName: string;

  /**
   * Enable captcha
   */
  @FormCheckbox({ displayName: LOCALE.ENABLE_CAPTCHA as string })
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('ENABLE_CAPTCHA')
  enableCaptcha: boolean = false;

  /**
   * Set case sensitivity for captcha
   */
  @FormCheckbox({ displayName: LOCALE.IS_CAPTCHA_CASE_SENSITIVE as string })
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('IS_CAPTCHA_CASE_SENSITIVE')
  isCaptchaCaseSensitive: boolean = false;

  /**
   * List of supported file types for current board (MIME)
   */
  @FormCheckboxList({
    displayName: LOCALE.ALLOWED_FILE_TYPES as string,
    values: allowedFileTypes
  })
  @IsOptional()
  @Transform(normalizeStringArray)
  @KIsArray('ALLOWED_FILE_TYPES')
  @KIsIn('ALLOWED_FILE_TYPES', Constants.SUPPORTED_FILE_TYPES, { each: true })
  allowedFileTypes: string[];

  /**
   * Can board threads start with an oekaki
   */
  @FormCheckbox({ displayName: LOCALE.ALLOW_OEKAKI_THREADS as string })
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('ALLOW_OEKAKI_THREADS')
  allowOekakiThreads: boolean = false;

  /**
   * Can replies contain an oekaki
   */
  @FormCheckbox({ displayName: LOCALE.ALLOW_OEKAKI_REPLIES as string })
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('ALLOW_OEKAKI_REPLIES')
  allowOekakiReplies: boolean = false;

  /**
   * HTML fragment with board rules
   */
  @FormTextarea({ displayName: LOCALE.RULES as string, rows: 6, cols: 60 })
  @IsOptional()
  @KIsString('RULES')
  rules: string;
}
