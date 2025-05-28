import { Transform } from 'class-transformer';
import { normalizePositiveInteger } from '@persistence/lib/transforms';
import { TimeUnits } from '@persistence/dto/ban';
import { KISEnum, KIsIp, KIsNotEmpty, KIsNumber, KIsString } from '@library/validators';

/**
 * Form with information to create a new ban
 */
export class BanCreateForm {
  /**
   * Banned IP
   */
  @KIsString('IP')
  @KIsNotEmpty('IP')
  @KIsIp('IP', 4)
  ip: string;

  /**
   * Ban duration time value
   */
  @Transform(normalizePositiveInteger)
  @KIsNumber('DURATION')
  @KIsNotEmpty('DURATION')
  timeValue: number;

  /**
   * Ban duration time unit
   */
  @KIsString('DURATION')
  @KIsNotEmpty('DURATION')
  @KISEnum('DURATION', TimeUnits)
  timeUnit: TimeUnits;

  /**
   * Ban reason
   */
  @KIsString('REASON')
  reason: string;
}
