import { IsOptional, IsString } from 'class-validator';

/**
 * Form from IP filter settings
 */
export class IpFilterForm {
  /**
   * IP blacklist regexp
   */
  @IsOptional()
  @IsString()
  blackList: string;
}
