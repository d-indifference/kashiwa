import { IsOptional } from 'class-validator';
import { KIsString } from '@library/validators';

/**
 * Form from IP filter settings
 */
export class IpFilterForm {
  /**
   * IP blacklist regexp
   */
  @IsOptional()
  @KIsString('BLACK_LIST')
  blackList: string;
}
