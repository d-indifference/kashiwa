import { IMediaFileHandlerStrategy } from '@posting/strategies/media-file-handler.strategy.interface';
import * as im from 'imagemagick';
import { InternalServerErrorException } from '@nestjs/common';

/**
 * Strategy for processing images by `imagemagick`
 */
export class ImagemagickStrategy implements IMediaFileHandlerStrategy {
  /**
   * Get dimensions of media file
   * @param filePath Full path to media file
   */
  public async getDimensions(filePath: string): Promise<{ width: number; height: number }> {
    const output = await new Promise<string>((resolve, reject) => {
      im.identify(['-format', '%wx%h', `${filePath}[0]`], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });

    const [w, h] = output.trim().split('x').map(Number);
    if (isNaN(w) || isNaN(h)) {
      throw new Error(`Invalid dimensions: ${output}`);
    }

    return { width: w, height: h };
  }

  /**
   * Create preview thumbnail for media file
   * @param srcPath Full path to source file
   * @param thumbPath Full path to thumbnail path
   * @param tnWidth Thumbnail width
   * @param tnHeight Thumbnail height
   */
  public createThumbnail(srcPath: string, thumbPath: string, tnWidth: number, tnHeight: number): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        im.convert(
          [
            srcPath,
            '-coalesce',
            '-resize',
            `${tnWidth}x${tnHeight}`,
            '-layers',
            'optimize',
            '-loop',
            '0',
            `${thumbPath}`
          ],
          err => {
            if (err) {
              reject(err);
            }
            resolve();
          }
        );
      });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
