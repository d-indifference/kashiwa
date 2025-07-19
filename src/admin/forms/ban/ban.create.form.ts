import { Transform } from 'class-transformer';
import { normalizePositiveInteger } from '@persistence/lib/transforms';
import { TimeUnits } from '@persistence/dto/ban';
import { KISEnum, KIsIp, KIsNotEmpty, KIsNumber, KIsString } from '@library/validators';
import { Form, FormHidden, FormInput, FormMethods, FormSelect, FormTextarea } from '@admin/lib';
import { LOCALE } from '@locale/locale';
import { IsOptional } from 'class-validator';
import { normalizeFormEmptyString } from '@admin/transforms';

/**
 * Form with information to create a new ban
 */
@Form({ method: FormMethods.POST, action: '/kashiwa/ban/new' })
export class BanCreateForm {
  /**
   * Banned IP
   */
  @FormInput({ type: 'text', displayName: LOCALE.IP as string })
  @KIsString('IP')
  @KIsNotEmpty('IP')
  @KIsIp('IP', 4)
  ip: string;

  /**
   * Ban duration time value
   */
  @FormInput({ type: 'number', displayName: LOCALE.DURATION as string })
  @Transform(normalizePositiveInteger)
  @KIsNumber('DURATION')
  @KIsNotEmpty('DURATION')
  timeValue: number;

  /**
   * Ban duration time unit
   */
  @FormSelect({
    displayName: LOCALE.DURATION as string,
    options: [
      { displayName: LOCALE.HOURS as string, value: TimeUnits.HOURS },
      { displayName: LOCALE.DAYS as string, value: TimeUnits.DAYS },
      { displayName: LOCALE.MONTHS as string, value: TimeUnits.MONTHS },
      { displayName: LOCALE.YEARS as string, value: TimeUnits.YEARS }
    ]
  })
  @KIsString('DURATION')
  @KIsNotEmpty('DURATION')
  @KISEnum('DURATION', TimeUnits)
  timeUnit: TimeUnits;

  /**
   * Ban reason
   */
  @FormTextarea({ displayName: LOCALE.REASON as string, cols: 60, rows: 6 })
  @KIsString('REASON')
  reason: string;

  /**
   * Board URL, where poster was banned.
   * If it is empty, poster will be banned in every board
   */
  @FormHidden()
  @IsOptional()
  @Transform(normalizeFormEmptyString)
  @KIsString('URL')
  boardUrl: string;
}
