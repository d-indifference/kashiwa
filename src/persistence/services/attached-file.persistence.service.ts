import { Injectable } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { AttachedFile } from '@prisma/client';

/**
 * Database queries for `Comment` model
 */
@Injectable()
export class AttachedFilePersistenceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find file by MD5. If file not found, returns `null`.
   * @param md5 MD5 hash of file
   */
  public async findFileByMd5(md5: string): Promise<AttachedFile | null> {
    const entity = await this.prisma.attachedFile.findFirst({ where: { md5 } });

    if (!entity) {
      return null;
    }

    return entity;
  }
}
