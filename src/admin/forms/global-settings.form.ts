import { KIsNotEmpty, KIsString } from '@library/validators';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Form, FormInput, FormTextarea, FormMethods } from '@admin/lib';
import { LOCALE } from '@locale/locale';
import { emptyFormText } from '@admin/transforms';

/**
 * Form for setting of global site settings
 */
@Form({ method: FormMethods.POST, action: '/kashiwa/global-settings' })
export class GlobalSettingsForm {
  /**
   * Site name
   */
  @FormInput({ type: 'text', displayName: LOCALE['SITE_NAME'] as string, size: 36 })
  @KIsString('SITE_NAME')
  @KIsNotEmpty('SITE_NAME')
  siteName: string;

  /**
   * Site slogan
   */
  @FormInput({ type: 'text', displayName: LOCALE['SITE_SLOGAN'] as string, size: 36 })
  @Transform(emptyFormText)
  @IsOptional()
  @KIsString('SITE_SLOGAN')
  siteSlogan?: string;

  /**
   * Main page HTML content
   */
  @FormTextarea({ displayName: LOCALE['MAIN_PAGE'] as string, rows: 30, cols: 60 })
  @KIsString('MAIN_PAGE')
  @KIsNotEmpty('MAIN_PAGE')
  mainPage: string;

  /**
   * Top panel HTML content
   */
  @FormTextarea({ displayName: LOCALE['BOARD_LIST'] as string, rows: 30, cols: 60 })
  @Transform(emptyFormText)
  @IsOptional()
  @KIsString('BOARD_LIST')
  boardList?: string;

  /**
   * FAQ page HTML content
   */
  @FormTextarea({ displayName: LOCALE['FAQ_PAGE'] as string, rows: 30, cols: 60 })
  @KIsString('FAQ_PAGE')
  @KIsNotEmpty('FAQ_PAGE')
  faqPage: string;

  /**
   * Rules page HTML content
   */
  @FormTextarea({ displayName: LOCALE['RULES_PAGE'] as string, rows: 30, cols: 60 })
  @KIsString('RULES_PAGE')
  @KIsNotEmpty('RULES_PAGE')
  rulesPage: string;

  /**
   * Menu frame HTML content
   */
  @FormTextarea({ displayName: LOCALE['MENU_FRAME'] as string, rows: 30, cols: 60 })
  @KIsString('MENU_FRAME')
  @KIsNotEmpty('MENU_FRAME')
  menuFrame: string;

  /**
   * Create a form from stored object
   * @param obj Stored object from global settings
   */
  public static fromGlobalSettings(obj: Pick<GlobalSettingsForm, keyof GlobalSettingsForm>) {
    return Object.assign(new GlobalSettingsForm(), obj);
  }
}
