/**
 * Strategy for processing media files
 */
export interface IMediaFileHandlerStrategy {
  /**
   * Get dimensions of media file
   * @param filePath Full path to media file
   */
  getDimensions(filePath: string): Promise<{ width: number; height: number }>;

  /**
   * Create preview thumbnail for media file
   * @param srcPath Full path to source file
   * @param thumbPath Full path to thumbnail path
   * @param tnWidth Thumbnail width
   * @param tnHeight Thumbnail height
   */
  createThumbnail(srcPath: string, thumbPath: string, tnWidth: number, tnHeight: number): Promise<void>;
}
