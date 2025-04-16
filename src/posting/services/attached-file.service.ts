import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AttachedFilePersistenceService } from '@persistence/services';
import { FilesystemOperator, ImageboardFileProvider } from '@library/filesystem';
import { MemoryStoredFile } from 'nestjs-form-data';

/**
 * Service for `AttachedFile` creation processing
 */
@Injectable()
export class AttachedFileService {
  constructor(
    private readonly attachedFilePersistenceService: AttachedFilePersistenceService,
    private readonly imageboardFileProvider: ImageboardFileProvider
  ) {}

  /**
   * Returns `AttachedFileCreationInput` and saves file if file does not exist on board.
   * If file exists, returns Prisma connection input of file
   * @param file File data from form
   * @param board Board URL
   */
  public async createAttachedFileCreationInput(
    file: MemoryStoredFile | undefined,
    board: string
  ): Promise<Pick<Prisma.CommentCreateInput, 'attachedFile'>> {
    if (!file) {
      return {};
    }

    const md5 = FilesystemOperator.md5(file.buffer);

    const fileByMd5 = await this.attachedFilePersistenceService.findFileByMd5(md5, board);

    if (fileByMd5) {
      return { attachedFile: { connect: { id: fileByMd5.id } } };
    }
    const newAttachedFile = await this.imageboardFileProvider.saveFile(file, board, md5);

    if (newAttachedFile) {
      return { attachedFile: { create: newAttachedFile } };
    }

    return {};
  }
}
