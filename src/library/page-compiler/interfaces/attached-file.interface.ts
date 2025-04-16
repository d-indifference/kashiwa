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
  width: number | null;

  /**
   * Image height
   */
  height: number | null;

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
  thumbnail?: string | null;

  /**
   * Thumbnail width (for images)
   */
  thumbnailWidth?: number | null;

  /**
   * Thumbnail height (for images)
   */
  thumbnailHeight?: number | null;
}
