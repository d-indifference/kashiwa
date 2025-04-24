import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeBooleanCheckbox, normalizeFormEmptyString } from '@admin/transforms';
import { IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

/**
 * Form for reply creation
 */
export class ReplyCreateForm {
  /**
   * `Name` field
   */
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_NAME'])) })
  @Length(0, 256, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE['FORM_NAME']), vStr(0), vStr(256)) })
  @Transform(normalizeFormEmptyString)
  name?: string;

  /**
   * `Email` field
   */
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_EMAIL'])) })
  @Length(0, 256, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE['FORM_EMAIL']), vStr(0), vStr(256)) })
  @Transform(normalizeFormEmptyString)
  email?: string;

  /**
   * `Subject` field
   */
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_SUBJECT'])) })
  @Length(0, 256, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE['FORM_SUBJECT']), vStr(0), vStr(256)) })
  @Transform(normalizeFormEmptyString)
  subject?: string;

  /**
   * `Comment` field
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_COMMENT'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['FORM_COMMENT'])) })
  @MinLength(3, { message: V_LOCALE['V_MIN_LENGTH'](vStr(LOCALE['FORM_COMMENT']), vStr(3)) })
  comment: string;

  /**
   * `Password` field
   */
  @Transform(normalizeFormEmptyString)
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_PASSWORD'])) })
  @Length(8, 8, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE['FORM_PASSWORD']), vStr(8), vStr(8)) })
  password: string = '';

  /**
   * `File` field
   */
  @IsOptional()
  @IsFile({ message: V_LOCALE['V_FILE'](vStr(LOCALE['FORM_FILE'])) })
  @MaxFileSize(20e6 - 1, { message: V_LOCALE['V_MAX_FILE_SIZE'](vStr(LOCALE['FORM_FILE'])) })
  @Transform(normalizeFormEmptyString)
  file?: MemoryStoredFile;

  /**
   * `Don't hit the thread` field
   */
  @Transform(normalizeBooleanCheckbox)
  @IsBoolean({ message: V_LOCALE['V_BOOLEAN'](vStr(LOCALE['FORM_DONT_HIT'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['FORM_DONT_HIT'])) })
  sage: boolean = false;

  /**
   * `Captcha` field with answer
   */
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FORM_CAPTCHA'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['FORM_CAPTCHA'])) })
  captcha?: string;

  /**
   * Hidden encrypted captcha answer
   */
  @IsOptional()
  @IsString({ message: LOCALE['CAPTCHA_ANSWER_ERROR'] as string })
  @IsNotEmpty({ message: LOCALE['CAPTCHA_ANSWER_ERROR'] as string })
  nya?: string;
}
