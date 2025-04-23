import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { emptyFormText } from '@admin/transforms';

/**
 * Form for setting of global site settings
 */
export class GlobalSettingsForm {
  /**
   * Site name
   */
  @IsString()
  @IsNotEmpty()
  siteName: string;

  /**
   * Site slogan
   */
  @Transform(emptyFormText)
  @IsOptional()
  @IsString()
  siteSlogan?: string;

  /**
   * Main page HTML content
   */
  @IsString()
  @IsNotEmpty()
  mainPage: string;

  /**
   * Top panel HTML content
   */
  @Transform(emptyFormText)
  @IsOptional()
  @IsString()
  boardList?: string;

  /**
   * FAQ page HTML content
   */
  @IsString()
  @IsNotEmpty()
  faqPage: string;

  /**
   * Rules page HTML content
   */
  @IsString()
  @IsNotEmpty()
  rulesPage: string;
}
