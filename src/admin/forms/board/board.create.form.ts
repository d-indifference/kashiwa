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

/**
 * Form object for creation of new board
 */
export class BoardCreateForm {
  /**
   * Board URL path
   */
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  @Matches(/^[a-z]+$/)
  url: string;

  /**
   * Board Name
   */
  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  name: string;

  /**
   * Is posting enabled
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  allowPosting: boolean = false;

  /**
   * Disable Name & Email fields
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  strictAnonymity: boolean = false;

  /**
   * Thread file attachment policy
   * `STRICT` - File is strictly required
   * `OPTIONAL` - File attachment is optional
   * `FORBIDDEN` - Files are strictly prohibited
   */
  @IsString()
  @IsNotEmpty()
  @IsIn([FileAttachmentMode.STRICT, FileAttachmentMode.FORBIDDEN, FileAttachmentMode.OPTIONAL])
  threadFileAttachmentMode: FileAttachmentMode;

  /**
   * Reply file attachment policy <br>
   * `STRICT` - File is strictly required <br>
   * `OPTIONAL` - File attachment is optional <br>
   * `FORBIDDEN` - Files are strictly prohibited
   */
  @IsString()
  @IsNotEmpty()
  @IsIn([FileAttachmentMode.STRICT, FileAttachmentMode.FORBIDDEN, FileAttachmentMode.OPTIONAL])
  replyFileAttachmentMode: FileAttachmentMode;

  /**
   * Delay between threads creations (seconds)
   */
  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  delayAfterThread: number;

  /**
   * Delay between replies creations (seconds)
   */
  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  delayAfterReply: number;

  /**
   * Minimal uploaded file size (bytes)
   */
  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  minFileSize: number;

  /**
   * Maximal uploaded file size (bytes)
   */
  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  maxFileSize: number;

  /**
   * Allow wakaba markdown.<br>
   * `true` - full wakaba markdown opportunities are enabled <br>
   * `false` - only replies (`>>123`), citations (`> test`) and links will be formated. <br>
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  allowMarkdown: boolean = false;

  /**
   * Allow tripcode parsing
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  allowTripcodes: boolean = false;

  /**
   * Maximum number of threads that can be on the board at the same time
   */
  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  maxThreadsOnBoard: number;

  /**
   * Number of posts after which the thread will not rise
   */
  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  bumpLimit: number;

  /**
   * Maximal size of Name, Email and subject fields
   */
  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(256)
  maxStringFieldSize: number;

  /**
   * Maximal size of Comment field
   */
  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  maxCommentSize: number;

  /**
   * Default poster name
   */
  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  defaultPosterName: string;

  /**
   * Default moderator name
   */
  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  defaultModeratorName: string;

  /**
   * Enable captcha
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  enableCaptcha: boolean = false;

  /**
   * Set case sensitivity for captcha
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  isCaptchaCaseSensitive: boolean = false;

  /**
   * List of supported file types for current board (MIME)
   */
  @Transform(normalizeStringArray)
  @IsArray()
  @IsIn(Constants.SUPPORTED_FILE_TYPES, { each: true })
  allowedFileTypes: string[] = [];

  /**
   * HTML fragment with board rules
   */
  @IsString()
  @IsNotEmpty()
  rules: string;
}
