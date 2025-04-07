import { IBoard, IPost } from 'src/library/page-compiler';

/**
 * Aggregated data for thread saving
 */
export interface IPage {
  /**
   * `Board` info
   */
  board: IBoard;

  /**
   * Opening post
   */
  openingPost: IPost;

  /**
   * Thread replies
   */
  replies: IPost[];
}
