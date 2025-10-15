import { Form, FormMethods, FormTextarea } from '@admin/lib';
import { LOCALE } from '@locale/locale';
import { IsOptional } from 'class-validator';
import { KIsString } from '@library/validators';

/**
 * Form for CORS settings
 */
@Form({ method: FormMethods.POST, action: '/kashiwa/cors-settings' })
export class CorsSettingsForm {
  /**
   * List of allowed origins
   */
  @FormTextarea({ displayName: LOCALE['ALLOWED_ORIGINS'] as string, rows: 25, cols: 60 })
  @IsOptional()
  @KIsString('ALLOWED_ORIGINS')
  allowedOrigins: string;
}
