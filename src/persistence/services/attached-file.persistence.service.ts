import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { AttachedFile } from '@prisma/client';
import { FilesystemOperator } from '@library/filesystem';
import { Constants } from '@library/constants';

/**
 * Database queries for `Comment` model
 */
@Injectable()
export class AttachedFilePersistenceService {
  private readonly logger: Logger = new Logger(AttachedFilePersistenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find file on board by MD5. If file not found, returns `null`.
   * @param md5 MD5 hash of file
   * @param board Board URL
   */
  public async findFileByMd5(md5: string, board: string): Promise<AttachedFile | null> {
    const entity = await this.prisma.attachedFile.findFirst({
      where: { md5, comments: { every: { board: { url: board } } } },
      include: { comments: { include: { board: true } } }
    });

    if (!entity) {
      return null;
    }

    return entity;
  }

  /**
   * Remove `AttachedFile` by ID with files on disk
   * @param id `AttachedFile` ID
   */
  public async removeById(id: string): Promise<void> {
    this.logger.log(`removeById, id: ${id}`);

    const file = await this.prisma.attachedFile.findFirst({ where: { id } });

    if (file) {
      await this.removeFileFromDisk(file);
    }

    await this.prisma.attachedFile.delete({ where: { id } });
  }

  /**
   * Remove orphaned `AttachedFile` from database and from disk
   */
  public async removeOrphaned(): Promise<void> {
    this.logger.log('removeOrphaned');

    const orphanedFiles = await this.prisma.attachedFile.findMany({ where: { comments: { none: {} } } });

    for (const file of orphanedFiles) {
      await this.removeFileFromDisk(file);
    }

    await this.prisma.attachedFile.deleteMany({ where: { id: { in: orphanedFiles.map(file => file.id) } } });
  }

  /**
   * Remove orphaned `AttachedFile` from disk
   * @param file `AttachedFile` model
   */
  private async removeFileFromDisk(file: AttachedFile): Promise<void> {
    const boardUrlsResult = await this.prisma.board.findMany({ select: { url: true } });

    const boardUrls = boardUrlsResult.map(val => val.url);

    for (const board of boardUrls) {
      await FilesystemOperator.remove(board, Constants.SRC_DIR, file.name);

      if (file.thumbnail) {
        await FilesystemOperator.remove(board, Constants.THUMB_DIR, file.thumbnail);
      }
    }
  }
}
