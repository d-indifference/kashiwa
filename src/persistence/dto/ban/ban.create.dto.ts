/**
 * Time units of form
 */
export enum TimeUnits {
  HOURS = 'hours',
  DAYS = 'days',
  MONTHS = 'months',
  YEARS = 'years'
}

/**
 * DTO with information for ban creation
 */
export class BanCreateDto {
  /**
   * Banned IP
   */
  ip: string;

  /**
   * Ban duration time value
   */
  timeValue: number;

  /**
   * Ban duration time unit
   */
  timeUnit: TimeUnits;

  /**
   * Ban reason
   */
  reason: string;

  constructor(ip: string, timeValue: number, timeUnit: TimeUnits, reason: string) {
    this.ip = ip;
    this.timeValue = timeValue;
    this.timeUnit = timeUnit;
    this.reason = reason;
  }
}
