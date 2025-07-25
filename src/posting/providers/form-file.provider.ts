import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MemoryStoredFile } from 'nestjs-form-data';
import { FileSystemProvider } from '@library/providers';
import { DateTime } from 'luxon';
import { Constants } from '@library/constants';
import * as path from 'node:path';
import { ImagemagickProvider } from '@posting/providers/imagemagick.provider';
import * as crypto from 'node:crypto';
import * as mime from 'mime-types';
import { BoardDto } from '@persistence/dto/board';

/**
 * Provider for form file operations
 */
@Injectable()
export class FormFileProvider {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly imagemagickProvider: ImagemagickProvider
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
    const isImage = this.isImage(file);

    const result: Prisma.AttachedFileCreateInput = {
      isImage,
      mime: file.mimeType,
      name,
      size: file.size,
      md5,
      board: { connect: { id: board.id } }
    };

    if (isImage) {
      await this.toImageDimensions(result, dest, name);
      await this.toImageThumbnail(result, dest, name);
    } else {
      const nonImageMime = mime.lookup(name);
      result.mime = nonImageMime !== false ? nonImageMime : file.mimeType;
    }

    return result;
  }

  private async saveFileToSrc(file: MemoryStoredFile, url: string): Promise<[string, string]> {
    const dest = this.getFileDestination(file, url);
    await this.fileSystem.writeBinaryFile(dest, file.buffer);
    return dest;
  }

  private getTimestampFilename(): string {
    return DateTime.now().toMillis().toString();
  }

  private getFileDestination(file: MemoryStoredFile, url: string): [string, string] {
    const newName = this.getTimestampFilename();
    const fileName = `${newName}.${file.extension}`;
    return [`${url}${path.sep}${Constants.SRC_DIR}`, fileName];
  }

  private isImage(file: MemoryStoredFile): boolean {
    return file.mimeType.split('/')[0] === 'image';
  }

  private async toImageDimensions(input: Prisma.AttachedFileCreateInput, dest: string, name: string): Promise<void> {
    const { width, height } = await this.imagemagickProvider.getImageDimensions([dest, name]);
    input.width = width;
    input.height = height;
  }

  private async toImageThumbnail(input: Prisma.AttachedFileCreateInput, dest: string, file: string): Promise<void> {
    const { thumbnail, thumbnailWidth, thumbnailHeight } = await this.imagemagickProvider.thumbnailImage(dest, file, {
      width: input.width ?? -1,
      height: input.height ?? -1
    });

    input.thumbnail = thumbnail;
    input.thumbnailWidth = thumbnailWidth;
    input.thumbnailHeight = thumbnailHeight;
  }
}
