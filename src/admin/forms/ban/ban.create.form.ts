import { IsEnum, IsIP, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizePositiveInteger } from '@persistence/lib/transforms';
import { TimeUnits } from '@persistence/dto/ban';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

/**
 * Form with information to create a new ban
 */
export class BanCreateForm {
  /**
   * Banned IP
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['IP'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['IP'])) })
  @IsIP(undefined, { message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['IP'])) })
  ip: string;

  /**
   * Ban duration time value
   */
  @Transform(normalizePositiveInteger)
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER'](vStr(LOCALE['DURATION'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['DURATION'])) })
  timeValue: number;

  /**
   * Ban duration time unit
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['DURATION'])) })
  @IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE['DURATION'])) })
  @IsEnum(TimeUnits, { message: V_LOCALE['V_ENUM'](vStr(LOCALE['DURATION']), TimeUnits) })
  timeUnit: TimeUnits;

  /**
   * Ban reason
   */
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['REASON'])) })
  reason: string;
}
