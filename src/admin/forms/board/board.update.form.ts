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

export class BoardUpdateForm {
  /**
   * Update candidate object ID (strictly required)
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  @Matches(/^[a-z]+$/)
  url: string;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  name: string;

  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  allowPosting: boolean = false;

  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  strictAnonymity: boolean = false;

  @IsOptional()
  @IsString()
  @IsIn([FileAttachmentMode.STRICT, FileAttachmentMode.FORBIDDEN, FileAttachmentMode.OPTIONAL])
  threadFileAttachmentMode: FileAttachmentMode;

  @IsOptional()
  @IsString()
  @IsIn([FileAttachmentMode.STRICT, FileAttachmentMode.FORBIDDEN, FileAttachmentMode.OPTIONAL])
  replyFileAttachmentMode: FileAttachmentMode;

  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  delayAfterThread: number;

  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  delayAfterReply: number;

  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  minFileSize: number;

  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  maxFileSize: number;

  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  allowMarkdown: boolean = false;

  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  allowTripcodes: boolean = false;

  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  maxThreadsOnBoard: number;

  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  bumpLimit: number;

  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  maxStringFieldSize: number;

  @IsOptional()
  @Transform(normalizeNumber)
  @IsNumber()
  @IsPositive()
  maxCommentSize: number;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  defaultPosterName: string;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  defaultModeratorName: string;

  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  enableCaptcha: boolean = false;

  @IsOptional()
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  isCaptchaCaseSensitive: boolean = false;

  @IsOptional()
  @Transform(normalizeStringArray)
  @IsArray()
  @IsIn(Constants.SUPPORTED_FILE_TYPES, { each: true })
  allowedFileTypes: string[];

  @IsOptional()
  @IsString()
  rules: string;
}
