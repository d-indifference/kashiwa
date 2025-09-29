import { Injectable } from '@nestjs/common';
import { AttachedFilePersistenceService, BoardPersistenceService } from '@persistence/services';
import { FormFileProvider } from '@posting/providers';
import { Prisma } from '@prisma/client';
import { MemoryStoredFile } from 'nestjs-form-data';
import { PinoLogger } from 'nestjs-pino';

/**
 * Service for working with attached files
 */
@Injectable()
export class AttachedFileService {
  constructor(
    private readonly attachedFilePersistenceService: AttachedFilePersistenceService,
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly formFileProvider: FormFileProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(AttachedFileService.name);
  }

  /**
   * Save attached file and get its Prisma creation input
   * @param file File from form data
   * @param boardUrl Board URL
   */
  public async createAttachedFile(
    file: MemoryStoredFile | undefined,
    boardUrl: string
  ): Promise<Pick<Prisma.CommentCreateInput, 'attachedFile'>> {
    this.logger.debug({ file, boardUrl }, 'createAttachedFile');

    if (file) {
      const md5 = this.formFileProvider.md5(file);
      const fileByMd5 = await this.attachedFilePersistenceService.findFileByMd5(md5, boardUrl);

      if (fileByMd5) {
        return { attachedFile: { connect: { id: fileByMd5.id } } };
      }

      const board = await this.boardPersistenceService.findByUrl(boardUrl);

      return { attachedFile: { create: await this.formFileProvider.saveFile(file, board, md5) } };
    }

    return {};
  }
}
