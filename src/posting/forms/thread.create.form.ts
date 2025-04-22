import { IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data';
import { IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeFormEmptyString } from '@admin/transforms';

/**
 * Form for thread creation
 */
export class ThreadCreateForm {
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
   * `Captcha` field with answer
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  captcha?: string;

  /**
   * Hidden encrypted captcha answer
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nya?: string;
}
