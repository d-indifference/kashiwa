import { Form, FormMethods, FormTextarea } from '@admin/lib';
import { LOCALE } from '@locale/locale';
import { IsOptional } from 'class-validator';
import { KIsString } from '@library/validators';

/**
 * Form for user-agent settings
 */
@Form({ method: FormMethods.POST, action: '/kashiwa/user-agents' })
export class UserAgentForm {
  /**
   * Regexps of blocked user agents
   */
  @FormTextarea({ displayName: LOCALE['BLOCKED_USER_AGENTS_LIST'] as string, rows: 45, cols: 60 })
  @IsOptional()
  @KIsString('BLOCKED_USER_AGENTS_LIST')
  forbiddenUserAgents: string;
}
