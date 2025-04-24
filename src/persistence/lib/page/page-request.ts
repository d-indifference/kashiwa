import { Constants } from '@library/constants';
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizePositiveInteger } from '@persistence/lib/transforms';
import { V_LOCALE } from '@locale/locale';

/**
 * Data transfer object for paginated requests.
 * Contains optional query parameters to specify the desired page number and page size.
 * If not provided, defaults will be used.
 */
export class PageRequest {
  /**
   * The current page number (zero-based)
   */
  @IsOptional()
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER']('page') })
  @Transform(normalizePositiveInteger)
  page: number = 0;

  /**
   * The number of items per page.
   * Optional. Defaults to `Constants.DEFAULT_PAGE_SIZE`.
   */
  @IsOptional()
  @IsNumber(undefined, { message: V_LOCALE['V_NUMBER']('limit') })
  @Transform(normalizePositiveInteger)
  limit: number = Constants.DEFAULT_PAGE_SIZE;

  constructor(page?: number, limit?: number) {
    this.page = page ?? 0;
    this.limit = limit ?? Constants.DEFAULT_PAGE_SIZE;
  }
}
