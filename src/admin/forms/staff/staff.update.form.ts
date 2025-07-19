import { Form, FormHidden, FormInput, FormMethods, FormPassword, FormSelect } from '@admin/lib';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { emptyFormText } from '@admin/transforms';
import { KIsEmail, KIsIn, KIsNotEmpty, KIsString, KIsUUIDv4, KLength } from '@library/validators';
import { LOCALE } from '@locale/locale';
import { UserRole } from '@prisma/client';

/**
 * Body object for staff updating form
 */
@Form({ action: '/kashiwa/staff/edit', method: FormMethods.POST })
export class StaffUpdateForm {
  /**
   * Update candidate object ID (strictly required)
   */
  @FormHidden()
  @KIsString('ID')
  @KIsNotEmpty('ID')
  @KIsUUIDv4('ID')
  id: string;

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
   * Role
   */
  @FormSelect({
    displayName: LOCALE.ROLE as string,
    options: [
      { displayName: LOCALE.ADMINISTRATOR as string, value: UserRole.ADMINISTRATOR },
      { displayName: LOCALE.MODERATOR as string, value: UserRole.MODERATOR }
    ]
  })
  @IsOptional()
  @KIsString('ROLE')
  @KIsIn('ROLE', [UserRole.ADMINISTRATOR, UserRole.MODERATOR])
  role?: UserRole;

  /**
   * Non-hashed password
   */
  @FormPassword({ size: 28, displayName: LOCALE.FORM_PASSWORD as string })
  @IsOptional()
  @KIsString('FORM_PASSWORD')
  password?: string;
}
