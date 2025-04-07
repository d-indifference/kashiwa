import { IAttachedFile } from '@library/page-compiler/interfaces/attached-file.interface';

/**
 * Object for `Comment` to its displaying on thread page
 */
export class IPost {
  /**
   * Post's attached file (doesn't require)
   */
  attachedFile?: IAttachedFile;

  /**
   * Post number shown on board
   */
  num: number;

  /**
   * Comment subject
   */
  subject: string;

  /**
   * Poster's name. It will be hidden if poster has a tripcode.
   */
  name: string;

  /**
   * Poster's email
   */
  email: string;

  /**
   * Poster's tripcode
   */
  tripcode: string;

  /**
   * Post creation date (will be formatted in template)
   */
  date: Date;

  /**
   * Check if the poster raises the thread
   */
  hasSage: boolean;

  /**
   * Comment (with not-inlined HTML)
   */
  comment: string;
}
