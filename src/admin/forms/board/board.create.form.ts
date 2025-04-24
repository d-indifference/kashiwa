import { FileAttachmentMode } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Matches,
  Max,
  Min
} from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeBooleanCheckbox, normalizeNumber, normalizeStringArray } from '@admin/transforms';
import { Constants } from '@library/constants';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

const fileAttachmentModes = [FileAttachmentMode.STRICT, FileAttachmentMode.FORBIDDEN, FileAttachmentMode.OPTIONAL];

/**
 * Form object for creation of new board
 */
export class BoardCreateForm {
  /**
   * Board URL path
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['URL'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['URL'])) })
  @Length(1, 64, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE['URL']), vStr(1), vStr(64)) })
  @Matches(/^[a-z]+$/, { message: V_LOCALE['V_BOARD_MATCHES'](vStr(LOCALE['URL'])) })
  url: string;

  /**
   * Board Name
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['NAME'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['NAME'])) })
  @Length(2, 256, { message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['NAME']), vStr(2), vStr(256)) })
  name: string;

  /**
   * Is posting enabled?
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean({ message: V_LOCALE['V_BOOLEAN'](vStr(LOCALE['ALLOW_POSTING'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['ALLOW_POSTING'])) })
  allowPosting: boolean = false;

  /**
   * Disable Name & Email fields
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean({ message: V_LOCALE['V_BOOLEAN'](vStr(LOCALE['STRICT_ANONYMITY'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['STRICT_ANONYMITY'])) })
  strictAnonymity: boolean = false;

  /**
   * Thread file attachment policy
   * `STRICT` - File is strictly required
   * `OPTIONAL` - File attachment is optional
   * `FORBIDDEN` - Files are strictly prohibited
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['THREAD_FILE_POLICY'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['THREAD_FILE_POLICY'])) })
  @IsIn(fileAttachmentModes, {
    message: V_LOCALE['V_IN'](vStr(LOCALE['THREAD_FILE_POLICY']), fileAttachmentModes)
  })
  threadFileAttachmentMode: FileAttachmentMode;

  /**
   * Reply file attachment policy <br>
   * `STRICT` - File is strictly required <br>
   * `OPTIONAL` - File attachment is optional <br>
   * `FORBIDDEN` - Files are strictly prohibited
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['REPLY_FILE_POLICY'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['REPLY_FILE_POLICY'])) })
  @IsIn(fileAttachmentModes, {
    message: V_LOCALE['V_IN'](vStr(LOCALE['REPLY_FILE_POLICY']), fileAttachmentModes)
  })
  replyFileAttachmentMode: FileAttachmentMode;

  /**
   * Delay between threads creations (seconds)
   */
  @Transform(normalizeNumber)
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER'](vStr(LOCALE['DELAY_AFTER_THREAD'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['DELAY_AFTER_THREAD'])) })
  @IsPositive({ message: V_LOCALE['V_POSITIVE'](vStr(LOCALE['DELAY_AFTER_THREAD'])) })
  delayAfterThread: number;

  /**
   * Delay between replies creations (seconds)
   */
  @Transform(normalizeNumber)
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER'](vStr(LOCALE['DELAY_AFTER_REPLY'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['DELAY_AFTER_REPLY'])) })
  @IsPositive({ message: V_LOCALE['V_POSITIVE'](vStr(LOCALE['DELAY_AFTER_REPLY'])) })
  delayAfterReply: number;

  /**
   * Minimal uploaded file size (bytes)
   */
  @Transform(normalizeNumber)
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER'](vStr(LOCALE['MIN_FILE_SIZE'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['MIN_FILE_SIZE'])) })
  @IsPositive({ message: V_LOCALE['V_POSITIVE'](vStr(LOCALE['MIN_FILE_SIZE'])) })
  minFileSize: number;

  /**
   * Maximal uploaded file size (bytes)
   */
  @Transform(normalizeNumber)
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER'](vStr(LOCALE['MAX_FILE_SIZE'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['MAX_FILE_SIZE'])) })
  @IsPositive({ message: V_LOCALE['V_POSITIVE'](vStr(LOCALE['MAX_FILE_SIZE'])) })
  maxFileSize: number;

  /**
   * Allow wakaba markdown.<br>
   * `true` - full wakaba markdown opportunities are enabled <br>
   * `false` - only replies (`>>123`), citations (`> test`) and links will be formated. <br>
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean({ message: V_LOCALE['V_BOOLEAN'](vStr(LOCALE['ALLOW_MARKDOWN'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['ALLOW_MARKDOWN'])) })
  allowMarkdown: boolean = false;

  /**
   * Allow tripcode parsing
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean({ message: V_LOCALE['V_BOOLEAN'](vStr(LOCALE['ALLOW_TRIPCODES'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['ALLOW_TRIPCODES'])) })
  allowTripcodes: boolean = false;

  /**
   * Maximum number of threads that can be on the board at the same time
   */
  @Transform(normalizeNumber)
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER'](vStr(LOCALE['MAX_THREADS_ON_BOARD'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['MAX_THREADS_ON_BOARD'])) })
  @IsPositive({ message: V_LOCALE['V_POSITIVE'](vStr(LOCALE['MAX_THREADS_ON_BOARD'])) })
  maxThreadsOnBoard: number;

  /**
   * Number of posts after which the thread will not rise
   */
  @Transform(normalizeNumber)
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER'](vStr(LOCALE['BUMP_LIMIT'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['BUMP_LIMIT'])) })
  @IsPositive({ message: V_LOCALE['V_POSITIVE'](vStr(LOCALE['BUMP_LIMIT'])) })
  bumpLimit: number;

  /**
   * Maximal size of Name, Email and subject fields
   */
  @Transform(normalizeNumber)
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER'](vStr(LOCALE['MAX_STRING_FIELD_SIZE'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['MAX_STRING_FIELD_SIZE'])) })
  @Min(0, { message: V_LOCALE['V_MIN'](vStr(LOCALE['MAX_STRING_FIELD_SIZE']), vStr(0)) })
  @Max(256, { message: V_LOCALE['V_MAX'](vStr(LOCALE['MAX_STRING_FIELD_SIZE']), vStr(256)) })
  maxStringFieldSize: number;

  /**
   * Maximal size of Comment field
   */
  @Transform(normalizeNumber)
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER'](vStr(LOCALE['MAX_COMMENT_SIZE'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['MAX_COMMENT_SIZE'])) })
  @IsPositive({ message: V_LOCALE['V_POSITIVE'](vStr(LOCALE['MAX_COMMENT_SIZE'])) })
  maxCommentSize: number;

  /**
   * Default poster name
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['DEFAULT_POSTER_NAME'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['DEFAULT_POSTER_NAME'])) })
  @Length(1, 256, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE['DEFAULT_POSTER_NAME']), vStr(1), vStr(256)) })
  defaultPosterName: string;

  /**
   * Default moderator name
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['DEFAULT_MODERATOR_NAME'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['DEFAULT_MODERATOR_NAME'])) })
  @Length(1, 256, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE['DEFAULT_MODERATOR_NAME']), vStr(1), vStr(256)) })
  defaultModeratorName: string;

  /**
   * Enable captcha
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean({ message: V_LOCALE['V_BOOLEAN'](vStr(LOCALE['ENABLE_CAPTCHA'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['ENABLE_CAPTCHA'])) })
  enableCaptcha: boolean = false;

  /**
   * Set case sensitivity for captcha
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean({ message: V_LOCALE['V_BOOLEAN'](vStr(LOCALE['IS_CAPTCHA_CASE_SENSITIVE'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['IS_CAPTCHA_CASE_SENSITIVE'])) })
  isCaptchaCaseSensitive: boolean = false;

  /**
   * List of supported file types for current board (MIME)
   */
  @Transform(normalizeStringArray)
  @IsArray({ message: V_LOCALE['V_ARRAY'](vStr(LOCALE['ALLOWED_FILE_TYPES'])) })
  @IsIn(Constants.SUPPORTED_FILE_TYPES, {
    each: true,
    message: V_LOCALE['V_IN'](vStr(LOCALE['ALLOWED_FILE_TYPES']), Constants.SUPPORTED_FILE_TYPES)
  })
  allowedFileTypes: string[] = [];

  /**
   * HTML fragment with board rules
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['RULES'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['RULES'])) })
  rules: string;
}
