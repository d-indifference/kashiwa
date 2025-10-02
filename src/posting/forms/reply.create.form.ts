import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeBooleanCheckbox, normalizeFormEmptyString } from '@library/transforms';
import { MemoryStoredFile } from 'nestjs-form-data';
import {
  KIsBase64,
  KIsBoolean,
  KIsFile,
  KIsNotEmpty,
  KIsString,
  KLength,
  KMaxFileSize,
  KMinLength
} from '@library/validators';

/**
 * Form for reply creation
 */
export class ReplyCreateForm {
  /**
   * `Name` field
   */
  @IsOptional()
  @KIsString('FORM_NAME')
  @KLength('FORM_NAME', 0, 256)
  @Transform(normalizeFormEmptyString)
  name?: string;

  /**
   * `Email` field
   */
  @IsOptional()
  @KIsString('FORM_EMAIL')
  @KLength('FORM_EMAIL', 0, 256)
  @Transform(normalizeFormEmptyString)
  email?: string;

  /**
   * `Subject` field
   */
  @IsOptional()
  @KIsString('FORM_SUBJECT')
  @KLength('FORM_SUBJECT', 0, 256)
  @Transform(normalizeFormEmptyString)
  subject?: string;

  /**
   * `Comment` field
   */
  @KIsString('FORM_COMMENT')
  @KIsNotEmpty('FORM_COMMENT')
  @KMinLength('FORM_COMMENT', 3)
  comment: string;

  /**
   * `Password` field
   */
  @Transform(normalizeFormEmptyString)
  @IsOptional()
  @KIsString('FORM_PASSWORD')
  @KLength('FORM_PASSWORD', 8, 8)
  password: string = '';

  /**
   * `File` field
   */
  @IsOptional()
  @KIsFile('FORM_FILE')
  @KMaxFileSize('FORM_FILE', 20e6 - 1)
  @Transform(normalizeFormEmptyString)
  file?: MemoryStoredFile;

  /**
   * `Don't hit the thread` field
   */
  @Transform(normalizeBooleanCheckbox)
  @KIsBoolean('FORM_DONT_HIT')
  @KIsNotEmpty('FORM_DONT_HIT')
  sage: boolean = false;

  /**
   * `Captcha` field with answer
   */
  @IsOptional()
  @KIsString('FORM_CAPTCHA')
  @KIsNotEmpty('FORM_CAPTCHA')
  captcha?: string;

  /**
   * Hidden encrypted captcha answer
   */
  @IsOptional()
  @KIsString('CAPTCHA_ANSWER_ERROR')
  @KIsNotEmpty('CAPTCHA_ANSWER_ERROR')
  nya?: string;

  /**
   * Base64 oekaki string
   */
  @IsOptional()
  @KIsString('OEKAKI')
  @KIsBase64('OEKAKI')
  oekaki?: string;
}
