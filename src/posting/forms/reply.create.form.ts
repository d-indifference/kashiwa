import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeBooleanCheckbox, normalizeFormEmptyString } from '@admin/transforms';
import { IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data';

/**
 * Form for reply creation
 */
export class ReplyCreateForm {
  /**
   * `Name` field
   */
  @IsOptional()
  @IsString()
  @Length(0, 256)
  @Transform(normalizeFormEmptyString)
  name?: string;

  /**
   * `Email` field
   */
  @IsOptional()
  @IsString()
  @Length(0, 256)
  @Transform(normalizeFormEmptyString)
  email?: string;

  /**
   * `Subject` field
   */
  @IsOptional()
  @IsString()
  @Length(0, 256)
  @Transform(normalizeFormEmptyString)
  subject?: string;

  /**
   * `Comment` field
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  comment: string;

  /**
   * `Password` field
   */
  @Transform(normalizeFormEmptyString)
  @IsOptional()
  @IsString()
  @Length(8, 8)
  password: string = '';

  /**
   * `File` field
   */
  @IsOptional()
  @IsFile()
  @MaxFileSize(20e6 - 1)
  @Transform(normalizeFormEmptyString)
  file?: MemoryStoredFile;

  /**
   * `Don't hit the thread` field
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean()
  @IsNotEmpty()
  sage: boolean = false;
}
