import { CommonPage } from '@library/misc';
import { BoardDto } from '@persistence/dto/board';
import { ICaptcha } from '@captcha/interfaces';
import { CommentDto } from '@persistence/dto/comment/common';

/**
 * Thread renderable page
 */
export class ThreadPage extends CommonPage {
  board: BoardDto;

  /**
   * Captcha image and answer
   */
  captcha?: ICaptcha;

  /**
   * Thread with its replies
   */
  thread: CommentDto;
}
