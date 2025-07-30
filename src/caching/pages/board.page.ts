import { BoardDto } from '@persistence/dto/board';
import { CommonPage } from '@library/misc';
import { ICaptcha } from '@captcha/interfaces';
import { Page } from '@persistence/lib/page';
import { ThreadCollapsedDto } from '@persistence/dto/comment/collapsed';

/**
 * Board renderable page
 */
export class BoardPage extends CommonPage {
  /**
   * Board & settings
   */
  board: BoardDto;

  /**
   * Captcha image and answer
   */
  captcha?: ICaptcha;

  /**
   * Page of threads with their replies
   */
  page: Page<ThreadCollapsedDto>;
}
