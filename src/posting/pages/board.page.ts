import { BoardDto } from '@persistence/dto/board';
import { applicationVersion, fileSize, formatDateTime, truncateText } from '@library/page-compiler';
import { Page } from '@persistence/lib/page';
import { ThreadCollapsedDto } from '@persistence/dto/comment/collapsed';
import { ICaptcha } from '@captcha/interfaces';

/**
 * Page template for `board.pug` template
 */
export class BoardPage {
  /**
   * Board data
   */
  board: BoardDto;

  /**
   * Captcha image and encrypted answer
   */
  captcha?: ICaptcha;

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

  constructor(board: BoardDto, threads: Page<ThreadCollapsedDto>, captcha?: ICaptcha) {
    this.board = board;
    this.threads = threads;
    this.captcha = captcha;
  }
}
