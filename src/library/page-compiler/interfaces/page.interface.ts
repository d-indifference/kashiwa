import { IBoard, IPost } from 'src/library/page-compiler';
import { ICaptcha } from '@captcha/interfaces';

/**
 * Aggregated data for thread saving
 */
export interface IPage {
  /**
   * `Board` info
   */
  board: IBoard;

  /**
   * Captcha object
   */
  captcha?: ICaptcha;

  /**
   * Opening post
   */
  openingPost: IPost;

  /**
   * Thread replies
   */
  replies: IPost[];
}
