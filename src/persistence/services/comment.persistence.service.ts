import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { CommentMapper } from '@persistence/mappers';
import { AttachedFile } from '@prisma/client';
import { CommentDto } from '@persistence/dto/comment';

@Injectable()
export class CommentPersistenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentMapper: CommentMapper
  ) {}

  public async findFileByMd5(md5: string): Promise<AttachedFile | null> {
    const entity = await this.prisma.attachedFile.findFirst({ where: { md5 } });

    if (!entity) {
      return null;
    }

    return entity;
  }

  public async findThread(url: string, num: bigint): Promise<CommentDto> {
    const openingPost = await this.prisma.comment.findFirst({
      include: { board: true, attachedFile: true },
      where: { board: { url }, num }
    });

    if (!openingPost) {
      throw new NotFoundException();
    }

    const replies = await this.prisma.comment.findMany({
      where: { parentId: openingPost.id },
      include: { attachedFile: true }
    });

    return this.commentMapper.toDto(openingPost, openingPost.attachedFile, replies);
  }
}
