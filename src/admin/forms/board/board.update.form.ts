import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
  Matches
} from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeBooleanCheckbox, normalizeNumber, normalizeStringArray } from '@admin/transforms';
import { FileAttachmentMode } from '@prisma/client';
import { Constants } from '@library/constants';

/**
 * Form object for creation of new board
 */
export class BoardUpdateForm {
  /**
   * Update candidate object ID (strictly required)
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  /**
   * Board URL path
   */
  @IsOptional()
  @IsString()
  @Length(1, 64)
  @Matches(/^[a-z]+$/)
  url: string;

  /**
   * Board Name
   */
  @IsOptional()
  @IsString()
  @Length(1, 256)
  name: string;

  /**
   * Is posting enabled
   */
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  allowPosting: boolean = false;

  /**
   * Disable Name & Email fields
   */
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  strictAnonymity: boolean = false;

  /**
   * Thread file attachment policy
   * `STRICT` - File is strictly required
   * `OPTIONAL` - File attachment is optional
   * `FORBIDDEN` - Files are strictly prohibited
   */
  @IsOptional()
  @IsString()
  @IsIn([FileAttachmentMode.STRICT, FileAttachmentMode.FORBIDDEN, FileAttachmentMode.OPTIONAL])
  threadFileAttachmentMode: FileAttachmentMode;

  /**
   * Reply file attachment policy <br>
   * `STRICT` - File is strictly required <br>
   * `OPTIONAL` - File attachment is optional <br>
   * `FORBIDDEN` - Files are strictly prohibited
   */
  @IsOptional()
  @IsString()
  @IsIn([FileAttachmentMode.STRICT, FileAttachmentMode.FORBIDDEN, FileAttachmentMode.OPTIONAL])
  replyFileAttachmentMode: FileAttachmentMode;

  /**
   * Delay between threads creations (seconds)
   */
  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  delayAfterThread: number;

  /**
   * Delay between replies creations (seconds)
   */
  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  delayAfterReply: number;

  /**
   * Minimal uploaded file size (bytes)
   */
  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  minFileSize: number;

  /**
   * Maximal uploaded file size (bytes)
   */
  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  maxFileSize: number;

  /**
   * Allow wakaba markdown.<br>
   * `true` - full wakaba markdown opportunities are enabled <br>
   * `false` - only replies (`>>123`), citations (`> test`) and links will be formated. <br>
   */
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  allowMarkdown: boolean = false;

  /**
   * Allow tripcode parsing
   */
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  allowTripcodes: boolean = false;

  /**
   * The maximum number of threads that can be on the board at the same time
   */
  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  maxThreadsOnBoard: number;

  /**
   * Number of posts after which the thread will not rise
   */
  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  bumpLimit: number;

  /**
   * Maximal size of Name, Email and subject fields
   */
  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  maxStringFieldSize: number;

  /**
   * Maximal size of Comment field
   */
  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  maxCommentSize: number;

  /**
   * Default poster name
   */
  @IsOptional()
  @IsString()
  @Length(1, 256)
  defaultPosterName: string;

  /**
   * Default moderator name
   */
  @IsOptional()
  @IsString()
  @Length(1, 256)
  defaultModeratorName: string;

  /**
   * Enable captcha
   */
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  enableCaptcha: boolean = false;

  /**
   * Set case sensitivity for captcha
   */
  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  isCaptchaCaseSensitive: boolean = false;

  /**
   * List of supported file types for current board (MIME)
   */
  @IsOptional()
  @Transform(normalizeStringArray)
  @IsArray()
  @IsIn(Constants.SUPPORTED_FILE_TYPES, { each: true })
  allowedFileTypes: string[];

  /**
   * HTML fragment with board rules
   */
  @IsOptional()
  @IsString()
  rules: string;
}
