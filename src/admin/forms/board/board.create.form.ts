import { FileAttachmentMode } from '@prisma/client';
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsNumber, IsPositive, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeBooleanCheckbox, normalizeNumber, normalizeStringArray } from '@admin/transforms';
import { Constants } from '@library/constants';

export class BoardCreateForm {
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  @Matches(/^[a-z]+$/)
  url: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  name: string;

  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  allowPosting: boolean = false;

  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  strictAnonymity: boolean = false;

  @IsString()
  @IsNotEmpty()
  @IsIn([FileAttachmentMode.STRICT, FileAttachmentMode.FORBIDDEN, FileAttachmentMode.OPTIONAL])
  threadFileAttachmentMode: FileAttachmentMode;

  @IsString()
  @IsNotEmpty()
  @IsIn([FileAttachmentMode.STRICT, FileAttachmentMode.FORBIDDEN, FileAttachmentMode.OPTIONAL])
  replyFileAttachmentMode: FileAttachmentMode;

  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  delayAfterThread: number;

  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  delayAfterReply: number;

  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  minFileSize: number;

  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  maxFileSize: number;

  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  allowMarkdown: boolean = false;

  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  allowTripcodes: boolean = false;

  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  maxThreadsOnBoard: number;

  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  bumpLimit: number;

  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  maxStringFieldSize: number;

  @Transform(normalizeNumber)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  maxCommentSize: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  defaultPosterName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  defaultModeratorName: string;

  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  enableCaptcha: boolean = false;

  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  isCaptchaCaseSensitive: boolean = false;

  @Transform(normalizeStringArray)
  @IsArray()
  @IsIn(Constants.SUPPORTED_FILE_TYPES, { each: true })
  allowedFileTypes: string[] = [];

  @IsString()
  @IsNotEmpty()
  rules: string;
}
