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
  num: bigint;

  /**
   * Comment subject
   */
  subject: string | null;

  /**
   * Poster's name. It will be hidden if poster has a tripcode.
   */
  name: string;

  /**
   * Poster's email
   */
  email: string | null;

  /**
   * Poster's tripcode
   */
  tripcode: string | null;

  /**
   * Post creation date (will be formatted in template)
   */
  date: Date;

  /**
   * Check if the poster raises the thread
   */
  hasSage: boolean = false;

  /**
   * Comment (with not-inlined HTML)
   */
  comment: string;
}
