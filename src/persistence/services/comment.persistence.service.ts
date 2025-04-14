import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { CommentMapper } from '@persistence/mappers';
import { CommentDto } from '@persistence/dto/comment/common';

/**
 * Database queries for `Comment` model
 */
@Injectable()
export class CommentPersistenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentMapper: CommentMapper
  ) {}

  /**
   * Find full thread by board URL and thread number. If not found, throws 404.
   * @param url Board URL
   * @param num Thread number on board
   */
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
