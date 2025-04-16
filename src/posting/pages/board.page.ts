import { BoardDto } from '@persistence/dto/board';
import { applicationVersion, fileSize, formatDateTime, truncateText } from '@library/page-compiler';
import { Page } from '@persistence/lib/page';
import { ThreadCollapsedDto } from '@persistence/dto/comment/collapsed';

/**
 * Page template for `board.pug` template
 */
export class BoardPage {
  /**
   * Board data
   */
  board: BoardDto;

  /**
   * Page with preview threads
   */
  threads: Page<ThreadCollapsedDto>;

  /**
   * `fileSize` helper
   */
  fileSize: (size: number) => string = fileSize;

  /**
   * `formatDateTime` helper
   */
  formatDateTime: (dateTime: Date) => string = formatDateTime;

  /**
   * `applicationVersion` helper
   */
  applicationVersion: () => string | undefined = applicationVersion;

  /**
   * `truncateText` helper
   */
  truncateText: (text: string, url: string, openingPost: bigint, num: bigint) => string = truncateText;

  constructor(board: BoardDto, threads: Page<ThreadCollapsedDto>) {
    this.board = board;
    this.threads = threads;
  }
}
