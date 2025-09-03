import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizePositiveInteger } from '@persistence/lib/transforms';
import { ApiProperty } from '@nestjs/swagger';
import { Constants } from '@library/constants';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

/**
 * REST API page request
 */
export class PageRequestDto {
  /**
   * The current page number (zero-based)
   */
  @ApiProperty({ description: 'The current page number (zero-based)', default: 0, required: false })
  @IsOptional()
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER'](vStr(LOCALE['PAGE'])) })
  @Transform(normalizePositiveInteger)
  page: number = 0;

  /**
   * The number of items per page
   */
  @ApiProperty({ description: 'The number of items per page', default: Constants.DEFAULT_PAGE_SIZE, required: false })
  @IsOptional()
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER'](vStr(LOCALE['LIMIT'])) })
  @Transform(normalizePositiveInteger)
  limit: number = Constants.DEFAULT_PAGE_SIZE;
}
