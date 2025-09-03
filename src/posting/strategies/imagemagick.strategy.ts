import { IMediaFileHandlerStrategy } from '@posting/strategies/media-file-handler.strategy.interface';
import { MediaUtilsWrapper } from '@posting/strategies/media-utils-wrapper';

/**
 * Strategy for processing images by `imagemagick`
 */
export class ImagemagickStrategy implements IMediaFileHandlerStrategy {
  /**
   * Get dimensions of media file
   * @param filePath Full path to media file
   */
  public async getDimensions(filePath: string): Promise<{ width: number; height: number }> {
    return await MediaUtilsWrapper.getDimensions(`identify -format %wx%h "${filePath}"[0]`, 'x');
  }

  /**
   * Create preview thumbnail for media file
   * @param srcPath Full path to source file
   * @param thumbPath Full path to thumbnail path
   * @param tnWidth Thumbnail width
   * @param tnHeight Thumbnail height
   */
  public async createThumbnail(srcPath: string, thumbPath: string, tnWidth: number, tnHeight: number): Promise<void> {
    await MediaUtilsWrapper.createThumbnail(
      `convert "${srcPath}" -coalesce -resize ${tnWidth}x${tnHeight} -layers optimize -loop 0 "${thumbPath}"`
    );
  }
}
