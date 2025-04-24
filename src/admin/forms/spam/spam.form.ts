import { IsOptional, IsString } from 'class-validator';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

/**
 * Form from spam settings
 */
export class SpamForm {
  /**
   * Spam words regexp
   */
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['SPAM_LIST'])) })
  spamList: string;
}
