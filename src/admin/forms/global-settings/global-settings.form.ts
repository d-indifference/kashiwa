import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { emptyFormText } from '@admin/transforms';
import { KIsNotEmpty, KIsString } from '@library/validators';

/**
 * Form for setting of global site settings
 */
export class GlobalSettingsForm {
  /**
   * Site name
   */
  @KIsString('SITE_NAME')
  @KIsNotEmpty('SITE_NAME')
  siteName: string;

  /**
   * Site slogan
   */
  @Transform(emptyFormText)
  @IsOptional()
  @KIsString('SITE_SLOGAN')
  siteSlogan?: string;

  /**
   * Main page HTML content
   */
  @KIsString('MAIN_PAGE')
  @KIsNotEmpty('MAIN_PAGE')
  mainPage: string;

  /**
   * Top panel HTML content
   */
  @Transform(emptyFormText)
  @IsOptional()
  @KIsString('BOARD_LIST')
  boardList?: string;

  /**
   * FAQ page HTML content
   */
  @KIsString('FAQ_PAGE')
  @KIsNotEmpty('FAQ_PAGE')
  faqPage: string;

  /**
   * Rules page HTML content
   */
  @KIsString('RULES_PAGE')
  @KIsNotEmpty('RULES_PAGE')
  rulesPage: string;
}
