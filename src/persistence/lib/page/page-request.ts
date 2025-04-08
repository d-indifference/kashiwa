import { Constants } from '@library/constants';
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizePositiveInteger } from '@persistence/lib/transforms';

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
  @IsNumber()
  @Transform(normalizePositiveInteger)
  page: number = 0;

  /**
   * The number of items per page.
   * Optional. Defaults to `Constants.DEFAULT_PAGE_SIZE`.
   */
  @IsOptional()
  @IsNumber()
  @Transform(normalizePositiveInteger)
  limit: number = Constants.DEFAULT_PAGE_SIZE;
}
