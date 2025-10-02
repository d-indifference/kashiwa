import { Injectable } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { PinoLogger } from 'nestjs-pino';
import { FileSystemProvider } from '@library/providers';
import { AttachedFile } from '@prisma/client';
import { Constants } from '@library/constants';

/**
 * Database queries for `Comment` model
 */
@Injectable()
export class AttachedFilePersistenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileSystem: FileSystemProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(AttachedFilePersistenceService.name);
  }

  /**
   * Find file on board by MD5. If file not found, returns `null`.
   * @param md5 MD5 hash of file
   * @param board Board URL
   */
  public async findFileByMd5(md5: string, board: string): Promise<AttachedFile | null> {
    this.logger.debug({ md5, board }, 'findFileByMd5');

    const entity = await this.prisma.attachedFile.findFirst({
      where: { md5, comments: { every: { board: { url: board } } } },
      include: { comments: { include: { board: true } } }
    });

    return entity ?? null;
  }

  /**
   * Clear file on board by comment nums and password.
   * @param url Board URL
   * @param nums List of comment nums
   * @param password User's password
   */
  public async clearByPassword(url: string, nums: bigint[], password: string): Promise<void> {
    this.logger.info({ url, password, nums }, 'clearByPassword');

    await this.prisma.$transaction(async tx => {
      const updateCandidates = await tx.attachedFile.findMany({
        where: { comments: { some: { board: { url }, num: { in: nums }, password } } },
        select: { id: true, name: true, thumbnail: true }
      });

      const batch = await tx.attachedFile.updateMany({
        data: { name: 'NO_THUMB', thumbnail: null },
        where: { id: { in: updateCandidates.map(c => c.id) } }
      });

      await Promise.all(
        updateCandidates.map(
          async c =>
            await Promise.all([
              await this.fileSystem.removePath([url, Constants.SRC_DIR, c.name]),
              await this.fileSystem.removePath([url, Constants.THUMB_DIR, c.thumbnail ?? '0'])
            ])
        )
      );

      this.logger.info({ count: batch.count }, '[SUCCESS] clearByPassword');
    });
  }

  /**
   * Clear file on board by comment num
   * @param url Board URL
   * @param num Comment number
   */
  public async clearFromComment(url: string, num: bigint): Promise<void> {
    this.logger.info({ url, num: num.toString() }, 'clearFromComment');

    await this.prisma.$transaction(async tx => {
      const comment = await tx.comment.findFirst({
        where: { board: { url }, num, NOT: { attachedFile: null } },
        include: { attachedFile: true }
      });

      if (comment) {
        if (comment.attachedFile) {
          const updated = await tx.attachedFile.update({
            where: { id: comment.attachedFile?.id },
            data: { name: 'NO_THUMB', thumbnail: null }
          });
          await Promise.all([
            await this.fileSystem.removePath([url, Constants.SRC_DIR, comment.attachedFile?.name]),
            await this.fileSystem.removePath([url, Constants.THUMB_DIR, comment.attachedFile?.thumbnail ?? '0'])
          ]);

          this.logger.info({ id: updated.id }, '[SUCCESS] clearFromComment');
        }
      }
    });
  }

  /**
   * Remove files without comments from board
   * @param url Board URL
   */
  public async removeOrphaned(url: string): Promise<void> {
    this.logger.info({ url }, 'removeOrphaned');

    await this.prisma.$transaction(async tx => {
      const orphaned = await tx.attachedFile.findMany({
        where: { comments: { none: {} }, board: { url } }
      });

      await Promise.all(
        orphaned.map(
          async file =>
            await Promise.all([
              await this.fileSystem.removePath([url, Constants.SRC_DIR, file.name]),
              await this.fileSystem.removePath([url, Constants.THUMB_DIR, file.thumbnail ?? '0'])
            ])
        )
      );

      const batch = await tx.attachedFile.deleteMany({ where: { id: { in: orphaned.map(o => o.id) } } });
      this.logger.info({ count: batch.count }, '[SUCCESS] removeOrphaned');
    });
  }
}
