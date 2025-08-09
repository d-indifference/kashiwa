import { BoardDto } from '@persistence/dto/board';
import { CommonPage } from '@library/misc';
import { Page } from '@persistence/lib/page';
import { CommentDto } from '@persistence/dto/comment/common';

/**
 * Catalog renderable page
 */
export class CatalogPage extends CommonPage {
  /**
   * Board & settings
   */
  board: BoardDto;

  /**
   * Page content
   */
  page: Page<CommentDto>;

  /**
   * Field for catalog ordering
   */
  orderBy: 'createdAt' | 'lastHit';
}
