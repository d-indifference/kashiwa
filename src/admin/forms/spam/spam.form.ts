import { IsOptional } from 'class-validator';
import { KIsString } from '@library/validators';

/**
 * Form from spam settings
 */
export class SpamForm {
  /**
   * Spam words regexp
   */
  @IsOptional()
  @KIsString('SPAM_LIST')
  spamList: string;
}
