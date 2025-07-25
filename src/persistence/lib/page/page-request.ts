import { Constants } from '@library/constants';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizePositiveInteger } from '@persistence/lib/transforms';
import { KIsNumber } from '@library/validators';

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
  @KIsNumber('page')
  @Transform(normalizePositiveInteger)
  page: number = 0;

  /**
   * The number of items per page.
   * Optional. Defaults to `Constants.DEFAULT_PAGE_SIZE`.
   */
  @IsOptional()
  @KIsNumber('limit')
  @Transform(normalizePositiveInteger)
  limit: number = Constants.DEFAULT_PAGE_SIZE;

  constructor(page?: number, limit?: number) {
    this.page = page ?? 0;
    this.limit = limit ?? Constants.DEFAULT_PAGE_SIZE;
  }
}
