import { Form, FormTextarea, FormMethods } from '@admin/lib';
import { IsOptional } from 'class-validator';
import { KIsString } from '@library/validators';
import { LOCALE } from '@locale/locale';

/**
 * Form from spam settings
 */
@Form({ method: FormMethods.POST, action: '/kashiwa/spam' })
export class SpamListForm {
  /**
   * Spam words regexp
   */
  @FormTextarea({ displayName: LOCALE['SPAM_LIST'] as string, rows: 45, cols: 60 })
  @IsOptional()
  @KIsString('SPAM_LIST')
  spamList: string;
}
