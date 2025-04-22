import { IsEnum, IsIP, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizePositiveInteger } from '@persistence/lib/transforms';
import { TimeUnits } from '@persistence/dto/ban';

/**
 * Form with information to create a new ban
 */
export class BanCreateForm {
  /**
   * Banned IP
   */
  @IsString()
  @IsNotEmpty()
  @IsIP()
  ip: string;

  /**
   * Ban duration time value
   */
  @Transform(normalizePositiveInteger)
  @IsNumber()
  @IsNotEmpty()
  timeValue: number;

  /**
   * Ban duration time unit
   */
  @IsString()
  @IsNotEmpty()
  @IsEnum(TimeUnits)
  timeUnit: TimeUnits;

  /**
   * Ban reason
   */
  @IsString()
  reason: string;
}
