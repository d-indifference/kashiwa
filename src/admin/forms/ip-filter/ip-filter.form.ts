import { IsOptional, IsString } from 'class-validator';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

/**
 * Form from IP filter settings
 */
export class IpFilterForm {
  /**
   * IP blacklist regexp
   */
  @IsOptional()
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['BLACK_LIST'])) })
  blackList: string;
}
