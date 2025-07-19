import { Form, FormInput, FormMethods, FormPassword } from '@admin/lib';
import { LOCALE } from '@locale/locale';
import { IsOptional } from 'class-validator';
import { KIsEmail, KIsNotEmpty, KIsString, KLength } from '@library/validators';
import { Transform } from 'class-transformer';
import { emptyFormText } from '@admin/transforms';

/**
 * Body object for staff updating form for every user
 */
@Form({ method: FormMethods.POST, action: '/kashiwa/staff/my' })
export class StaffUpdateMyselfForm {
  /**
   * Username
   */
  @FormInput({ type: 'text', size: 28, displayName: LOCALE.USERNAME as string })
  @IsOptional()
  @KIsString('USERNAME')
  @KLength('USERNAME', 3, 256)
  @Transform(emptyFormText)
  username?: string;

  /**
   * Email
   */
  @FormInput({ type: 'email', size: 28, displayName: LOCALE.FORM_EMAIL as string })
  @KIsString('FORM_EMAIL')
  @KIsNotEmpty('FORM_EMAIL')
  @KIsEmail('FORM_EMAIL')
  @KLength('FORM_EMAIL', 3, 256)
  email?: string;

  /**
   * Non-hashed password
   */
  @FormPassword({ size: 28, displayName: LOCALE.FORM_PASSWORD as string })
  @IsOptional()
  @KIsString('FORM_PASSWORD')
  password?: string;
}
