import { IsOptional, IsString } from 'class-validator';

/**
 * Form from spam settings
 */
export class SpamForm {
  /**
   * Spam words regexp
   */
  @IsOptional()
  @IsString()
  spamList: string;
}
