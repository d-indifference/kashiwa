/**
 * Object for AttachedFile to its displaying on thread page
 */
export interface IAttachedFile {
  /**
   * File name
   */
  name: string;

  /**
   * File size (bytes)
   */
  size: number;

  /**
   * Image width
   */
  width: number;

  /**
   * Image height
   */
  height: number;

  /**
   * Check if the file is an image
   */
  isImage: boolean;

  /**
   * MIME-type
   */
  mime: string;

  /**
   * Thumbnail name (for images)
   */
  thumbnail?: string;

  /**
   * Thumbnail width (for images)
   */
  thumbnailWidth?: number;

  /**
   * Thumbnail height (for images)
   */
  thumbnailHeight?: number;
}
