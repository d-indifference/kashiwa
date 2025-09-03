import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as path from 'node:path';
import { Constants } from '@library/constants';
import { AttachedFile } from '@prisma/client';
import { IMediaFileHandlerStrategy } from '@posting/strategies';
import { ConfigService } from '@nestjs/config';

/**
 * Provider for media file operations
 */
@Injectable()
export class MediaFileHandlerProvider {
  constructor(private readonly config: ConfigService) {}

  /**
   * Calculate image dimensions
   * @param strategy File processing strategy
   * @param fileRelativePath Relative path to file
   */
  public async getDimensions(
    strategy: IMediaFileHandlerStrategy,
    fileRelativePath: string[]
  ): Promise<Pick<AttachedFile, 'width' | 'height'>> {
    const filePath = path.join(this.getVolume(), ...fileRelativePath);
    return await strategy.getDimensions(filePath);
  }

  /**
   * Make the image thumbnail
   * @param strategy File processing strategy
   * @param isVideo Is source file a video
   * @param dest Source file directory
   * @param file Source file name
   * @param dimensions Source file dimensions
   */
  public async createThumbnail(
    strategy: IMediaFileHandlerStrategy,
    isVideo: boolean,
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

    const filePath = path.join(this.getVolume(), dest, file);
    const [filename, ext] = file.split('.');
    const thumbExt = isVideo ? 'png' : ext;
    const boardUrl = dest.split(path.sep)[0];

    let tnWidth: number = srcWidth;
    let tnHeight: number = srcHeight;

    const thumbName = `${filename}s.${thumbExt}`;
    const thumbDir = path.join(this.getVolume(), boardUrl, Constants.THUMB_DIR);
    const thumbPath = path.join(thumbDir, thumbName);

    if (srcWidth > Constants.DEFAULT_THUMBNAIL_SIDE || srcHeight > Constants.DEFAULT_THUMBNAIL_SIDE) {
      if (srcWidth > srcHeight) {
        tnWidth = Constants.DEFAULT_THUMBNAIL_SIDE;
        tnHeight = Math.floor((tnWidth * srcHeight) / srcWidth);
      } else if (srcWidth < srcHeight) {
        tnHeight = Constants.DEFAULT_THUMBNAIL_SIDE;
        tnWidth = Math.floor((tnHeight * srcWidth) / srcHeight);
      } else {
        tnWidth = Constants.DEFAULT_THUMBNAIL_SIDE;
        tnHeight = Constants.DEFAULT_THUMBNAIL_SIDE;
      }
    }

    await strategy.createThumbnail(filePath, thumbPath, tnWidth, tnHeight);

    return { thumbnail: thumbName, thumbnailWidth: tnWidth, thumbnailHeight: tnHeight };
  }

  /**
   * Returns the volume path from config file
   */
  private getVolume(): string {
    return this.config.getOrThrow<string>('file-storage.path');
  }
}
