import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as im from 'imagemagick';
import * as path from 'node:path';
import { Constants } from '@library/constants';
import { AttachedFile } from '@prisma/client';

/**
 * Provider for imagemagick operations
 */
@Injectable()
export class ImagemagickProvider {
  /**
   * Calculate image dimensions
   * @param fileRelativePath Relative path to file
   */
  public async getImageDimensions(fileRelativePath: string[]): Promise<Pick<AttachedFile, 'width' | 'height'>> {
    const filePath = path.join(Constants.Paths.APP_VOLUME, ...fileRelativePath);
    const output = await new Promise<string>((resolve, reject) => {
      im.identify(['-format', '%wx%h', filePath], (err, result) => {
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
   * Make the image thumbnail
   * @param dest Source file directory
   * @param file Source file name
   * @param dimensions Source file dimensions
   */
  public thumbnailImage(
    dest: string,
    file: string,
    dimensions: Pick<AttachedFile, 'width' | 'height'>
  ): Promise<Pick<AttachedFile, 'thumbnail' | 'thumbnailWidth' | 'thumbnailHeight'>> {
    if (!dimensions.width && !dimensions.height) {
      throw new InternalServerErrorException();
    }

    if (dimensions.width === null && dimensions.height === null) {
      throw new InternalServerErrorException();
    }

    const srcWidth = dimensions.width ?? -1;
    const srcHeight = dimensions.height ?? -1;

    const filePath = path.join(Constants.Paths.APP_VOLUME, dest, file);
    const [filename, ext] = file.split('.');
    const boardUrl = dest.split(path.sep)[0];

    let tnWidth: number = srcWidth;
    let tnHeight: number = srcHeight;

    const thumbName = `${filename}s.${ext}`;
    const thumbDir = path.join(Constants.Paths.APP_VOLUME, boardUrl, Constants.THUMB_DIR);
    const thumbPath = path.join(thumbDir, thumbName);

    if (srcWidth > Constants.DEFAULT_THUMBNAIL_SIDE && srcHeight > Constants.DEFAULT_THUMBNAIL_SIDE) {
      if (srcWidth > srcHeight) {
        tnWidth = Constants.DEFAULT_THUMBNAIL_SIDE;
        tnHeight = Math.floor((tnWidth * srcHeight) / srcWidth);
      } else if (srcWidth < srcHeight) {
        tnHeight = Constants.DEFAULT_THUMBNAIL_SIDE;
        tnWidth = Math.floor((tnHeight * srcWidth) / srcHeight);
      } else {
        tnWidth = 200;
        tnHeight = 200;
      }
    }

    return new Promise((resolve, reject) => {
      im.convert(
        [filePath, '-coalesce', '-resize', `${tnWidth}x${tnHeight}`, '-layers', 'optimize', '-loop', '0', thumbPath],
        err => {
          if (err) {
            reject(err);
          }
          resolve({ thumbnail: thumbName, thumbnailWidth: tnWidth, thumbnailHeight: tnHeight });
        }
      );
    });
  }
}
