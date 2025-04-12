import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MemoryStoredFile } from 'nestjs-form-data';
import { FilesystemOperator } from '@library/filesystem/filesystem-operator';
import { DateTime } from 'luxon';
import * as im from 'imagemagick';
import * as path from 'node:path';
import { Constants } from '@library/constants';
import { IFile } from '@library/filesystem/file.interface';
import { AttachedFile, Prisma } from '@prisma/client';

/**
 * File provider to saving file binaries and creating of `AttachedFile` entity
 */
@Injectable()
export class ImageboardFileProvider {
  /**
   * Saves a file. If file is big image, makes thumbnail. Returns new `AttachedFile`
   * @param file Form data file temporary stored in memory
   * @param board Board URL
   * @param md5 MD5 file hash
   */
  public async saveFile(
    file: MemoryStoredFile,
    board: string,
    md5: string
  ): Promise<Prisma.AttachedFileCreateInput | null> {
    if (!file) {
      return null;
    }

    const result: Prisma.AttachedFileCreateInput = {
      isImage: false,
      mime: '',
      name: '',
      size: 0,
      md5
    };

    const savedSrcFile = await FilesystemOperator.fromFormData(file)
      .toTarget(board, Constants.SRC_DIR)
      .setNewName(this.getTimestampFilename())
      .save();

    const isImage = this.isImage(savedSrcFile);

    result.name = savedSrcFile.originalName;
    result.size = savedSrcFile.size;
    result.isImage = isImage;

    if (isImage) {
      const dimensions = await this.getDimensions(savedSrcFile);
      result.width = dimensions.width;
      result.height = dimensions.height;
      result.mime = savedSrcFile.mimeType;
      result.isImage = isImage;

      await FilesystemOperator.mkdir(board, Constants.THUMB_DIR);
      const thumbResult = await this.makeThumbnail(board, savedSrcFile, dimensions);

      result.thumbnail = thumbResult.thumbnail;
      result.thumbnailWidth = thumbResult.thumbnailWidth;
      result.thumbnailHeight = thumbResult.thumbnailHeight;
    }

    return result;
  }

  /**
   * Make a file name
   */
  private getTimestampFilename(): string {
    return DateTime.now().toMillis().toString();
  }

  /**
   * Get source file dimensions
   */
  private getDimensions(file: IFile): Promise<Pick<AttachedFile, 'width' | 'height'>> {
    const filePath = path.join(file.path, file.originalName);

    return new Promise((resolve, reject) => {
      im.identify(['-format', '%wx%h,', filePath], (err, result) => {
        if (err) {
          reject(new InternalServerErrorException(err));
        }

        const dimensions = result
          .split(',')[0]
          .split('x')
          .map(d => Number(d));

        resolve({ width: dimensions[0], height: dimensions[1] });
      });
    });
  }

  /**
   * Check if file is an image
   */
  private isImage(file: IFile): boolean {
    return file.mimeType.split('/')[0] === 'image';
  }

  /**
   * Makes image thumbnail and returns thumbnail data
   */
  private makeThumbnail(
    board: string,
    file: IFile,
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

    const filePath = path.join(file.path, file.originalName);

    let tnWidth: number = srcWidth;
    let tnHeight: number = srcHeight;

    const thumbName = `${file.originalName.split('.')[0]}s.${file.ext}`;
    const thumbDir = path.join(Constants.Paths.APP_VOLUME, board, Constants.THUMB_DIR);
    const thumbPath = path.join(thumbDir, thumbName);

    if (srcWidth > Constants.DEFAULT_THUMBNAIL_SIDE && srcHeight > Constants.DEFAULT_THUMBNAIL_SIDE) {
      if (srcWidth > srcHeight) {
        tnWidth = Constants.DEFAULT_THUMBNAIL_SIDE;
        tnHeight = Math.floor((tnWidth * srcHeight) / srcHeight);
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
