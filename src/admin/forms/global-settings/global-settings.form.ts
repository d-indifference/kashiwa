import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { emptyFormText } from '@admin/transforms';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

/**
 * Form for setting of global site settings
 */
export class GlobalSettingsForm {
  /**
   * Site name
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['SITE_NAME'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['SITE_NAME'])) })
  siteName: string;

  /**
   * Site slogan
   */
  @Transform(emptyFormText)
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['SITE_SLOGAN'])) })
  siteSlogan?: string;

  /**
   * Main page HTML content
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['MAIN_PAGE'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['MAIN_PAGE'])) })
  mainPage: string;

  /**
   * Top panel HTML content
   */
  @Transform(emptyFormText)
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['BOARD_LIST'])) })
  boardList?: string;

  /**
   * FAQ page HTML content
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['FAQ_PAGE'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['FAQ_PAGE'])) })
  faqPage: string;

  /**
   * Rules page HTML content
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['RULES_PAGE'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['RULES_PAGE'])) })
  rulesPage: string;
}
