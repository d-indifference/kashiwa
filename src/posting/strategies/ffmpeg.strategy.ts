import { IMediaFileHandlerStrategy } from '@posting/strategies/media-file-handler.strategy.interface';
import { MediaUtilsWrapper } from '@posting/strategies/media-utils-wrapper';

/**
 * Strategy for processing videos by `ffmpeg`
 */
export class FfmpegStrategy implements IMediaFileHandlerStrategy {
  /**
   * Get dimensions of media file
   * @param filePath Full path to media file
   */
  public async getDimensions(filePath: string): Promise<{ width: number; height: number }> {
    return await MediaUtilsWrapper.getDimensions(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${filePath}"`,
      ','
    );
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
      `ffmpeg -i "${srcPath}" -vf "scale=${tnWidth}:${tnHeight}:flags=lanczos,format=rgba" -frames:v 1 -pix_fmt rgba "${thumbPath}"`
    );
  }
}
