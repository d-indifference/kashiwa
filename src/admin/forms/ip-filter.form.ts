import { Form, FormTextarea, FormMethods } from '@admin/lib';
import { IsOptional } from 'class-validator';
import { KIsString } from '@library/validators';
import { LOCALE } from '@locale/locale';

/**
 * Form from IP filter settings
 */
@Form({ method: FormMethods.POST, action: '/kashiwa/ip-filter' })
export class IpFilterForm {
  /**
   * IP blacklist regexp
   */
  @FormTextarea({ displayName: LOCALE['BLACK_LIST'] as string, rows: 45, cols: 60 })
  @IsOptional()
  @KIsString('BLACK_LIST')
  blackList: string;
}
