import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MemoryStoredFile } from 'nestjs-form-data';
import { FileSystemProvider } from '@library/providers';
import { DateTime } from 'luxon';
import { Constants } from '@library/constants';
import * as path from 'node:path';
import { MediaFileHandlerProvider } from '@posting/providers/media-file-handler.provider';
import * as crypto from 'node:crypto';
import * as mime from 'mime-types';
import { BoardDto } from '@persistence/dto/board';
import { FfmpegStrategy, ImagemagickStrategy, IMediaFileHandlerStrategy } from '@posting/strategies';

/**
 * Provider for form file operations
 */
@Injectable()
export class FormFileProvider {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly mediaFileHandlerProvider: MediaFileHandlerProvider
  ) {}

  /**
   * Get file's MD5
   * @param file File from form
   */
  public md5(file: MemoryStoredFile): string {
    return crypto.createHash('md5').update(file.buffer).digest('hex');
  }

  /**
   * Saves a file. If file is big image, makes thumbnail. Returns new `AttachedFile`
   * @param file Form data file temporary stored in memory
   * @param board Board with settings
   * @param md5 MD5 file hash
   */
  public async saveFile(file: MemoryStoredFile, board: BoardDto, md5: string): Promise<Prisma.AttachedFileCreateInput> {
    const [dest, name] = await this.saveFileToSrc(file, board.url);
    const isImage = this.isMedia(file, 'image');
    const isVideo = this.isMedia(file, 'video');

    const result: Prisma.AttachedFileCreateInput = {
      isImage,
      isVideo,
      mime: file.mimeType,
      name,
      size: file.size,
      md5,
      board: { connect: { id: board.id } }
    };

    if (!isImage && !isVideo) {
      const nonImageMime = mime.lookup(name);
      result.mime = nonImageMime !== false ? nonImageMime : file.mimeType;
    } else {
      let currentStrategy: IMediaFileHandlerStrategy;

      if (isImage) {
        currentStrategy = new ImagemagickStrategy();
      } else if (isVideo) {
        currentStrategy = new FfmpegStrategy();
      } else {
        throw new InternalServerErrorException('File processing strategy is not implemented');
      }

      await this.toMediaDimensions(currentStrategy, result, dest, name);
      await this.toMediaThumbnail(currentStrategy, result, dest, name);
    }

    return result;
  }

  /**
   * Save file to `src` directory and return its destination
   */
  private async saveFileToSrc(file: MemoryStoredFile, url: string): Promise<[string, string]> {
    const dest = this.getFileDestination(file, url);
    await this.fileSystem.writeBinaryFile(dest, file.buffer);
    return dest;
  }

  /**
   * Get saved file name based on current timestamp
   */
  private getTimestampFilename(): string {
    return DateTime.now().toMillis().toString();
  }

  /**
   * Get the new destination of the saved file
   */
  private getFileDestination(file: MemoryStoredFile, url: string): [string, string] {
    const newName = this.getTimestampFilename();
    const fileName = `${newName}.${file.extension}`;
    return [`${url}${path.sep}${Constants.SRC_DIR}`, fileName];
  }

  /**
   * Check if file is an image or video
   */
  private isMedia(file: MemoryStoredFile, mimePrefix: 'image' | 'video'): boolean {
    return file.mimeType.split('/')[0] === mimePrefix;
  }

  /**
   * Get source file dimensions and set them to creation input
   */
  private async toMediaDimensions(
    strategy: IMediaFileHandlerStrategy,
    input: Prisma.AttachedFileCreateInput,
    dest: string,
    name: string
  ): Promise<void> {
    const { width, height } = await this.mediaFileHandlerProvider.getDimensions(strategy, [dest, name]);
    input.width = width;
    input.height = height;
  }

  /**
   * Make an image thumbnail and set its data to creation input
   */
  private async toMediaThumbnail(
    strategy: IMediaFileHandlerStrategy,
    input: Prisma.AttachedFileCreateInput,
    dest: string,
    file: string
  ): Promise<void> {
    const { thumbnail, thumbnailWidth, thumbnailHeight } = await this.mediaFileHandlerProvider.createThumbnail(
      strategy,
      strategy instanceof FfmpegStrategy,
      dest,
      file,
      {
        width: input.width ?? -1,
        height: input.height ?? -1
      }
    );

    input.thumbnail = thumbnail;
    input.thumbnailWidth = thumbnailWidth;
    input.thumbnailHeight = thumbnailHeight;
  }
}
