import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { PinoLogger } from 'nestjs-pino';
import { CommentDto } from '@persistence/dto/comment/common';
import { LOCALE } from '@locale/locale';
import { CommentMapper } from '@persistence/mappers';
import { Prisma, Comment } from '@prisma/client';
import { BoardPersistenceService } from '@persistence/services/board.persistence.service';
import { Page, PageRequest } from '@persistence/lib/page';
import { ThreadCollapsedDto } from '@persistence/dto/comment/collapsed';
import { AttachedFilePersistenceService } from '@persistence/services/attached-file.persistence.service';
import { CommentModerationDto } from '@persistence/dto/comment/moderation';

/**
 * Database queries for `Comment` model
 */
@Injectable()
export class CommentPersistenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentMapper: CommentMapper,
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly attachedFilePersistenceService: AttachedFilePersistenceService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(CommentPersistenceService.name);
  }

  /**
   * Get all comments count
   */
  public async countAll(): Promise<number> {
    return (await this.prisma.comment.count()) as number;
  }

  /**
   * Get threads count on board
   * @param url board URL
   */
  public async threadCount(url: string): Promise<number> {
    return (await this.prisma.comment.count({ where: { board: { url }, NOT: { lastHit: null } } })) as number;
  }

  /**
   * Get all threads with their replies and paginate them
   * @param boardId Board ID
   * @param page Page request
   */
  public async findAll(boardId: string, page: PageRequest): Promise<Page<ThreadCollapsedDto>> {
    const comments = await Page.ofFilter<
      Comment,
      Prisma.CommentWhereInput,
      Prisma.CommentOrderByWithAggregationInput,
      Prisma.CommentInclude
    >(
      this.prisma,
      'comment',
      page,
      { boardId, lastHit: { not: null } },
      { lastHit: 'desc' },
      { attachedFile: true, children: { orderBy: { createdAt: 'asc' }, include: { attachedFile: true } } }
    );

    return comments.map(c => this.commentMapper.toCollapsedDto(c));
  }

  /**
   * Find list of all thread numbers on board
   * @param url board URL
   */
  public async findThreadNums(url: string): Promise<bigint[]> {
    return (
      await this.prisma.comment.findMany({
        where: { board: { url }, NOT: { lastHit: null } },
        select: { num: true }
      })
    ).map(n => n.num);
  }

  /**
   * Get all threads with their replies and paginate them as moderation DTO
   * @param boardId Board ID
   * @param page Page request
   */
  public async findManyForModeration(boardId: string, page: PageRequest): Promise<Page<CommentModerationDto>> {
    const comments = await Page.ofFilter<
      Comment,
      Prisma.CommentWhereInput,
      Prisma.CommentOrderByWithAggregationInput,
      Prisma.CommentInclude
    >(
      this.prisma,
      'comment',
      page,
      { board: { id: boardId } },
      { createdAt: 'desc' },
      { attachedFile: { include: { board: true } }, parent: true, board: true }
    );

    return comments.map(c => this.commentMapper.toModerationDto(c));
  }

  /**
   * Find full thread by board URL and thread number. If not found, throws 404.
   * @param url Board URL
   * @param num Thread number on board
   */
  public async findThread(url: string, num: bigint): Promise<CommentDto> {
    const openingPost = await this.prisma.comment.findFirst({
      include: {
        board: { include: { boardSettings: true } },
        attachedFile: true,
        children: { include: { attachedFile: true }, orderBy: { createdAt: 'asc' } }
      },
      where: { board: { url }, num, NOT: { lastHit: null } }
    });

    if (!openingPost) {
      throw new NotFoundException((LOCALE['THREAD_NOT_FOUND'] as CallableFunction)(url, num.toString()));
    }

    return this.commentMapper.toDto(openingPost, openingPost.children);
  }

  /**
   * Find opening post by board URL and thread number. If not found, throws 404.
   * @param url Board URL
   * @param num Thread number on board
   */
  public async findOpeningPost(url: string, num: bigint): Promise<CommentDto> {
    const post = await this.prisma.comment.findFirst({ where: { board: { url }, num, NOT: { lastHit: null } } });

    if (!post) {
      throw new NotFoundException((LOCALE['THREAD_NOT_FOUND'] as CallableFunction)(url, num.toString()));
    }

    return this.commentMapper.toDto(post);
  }

  /**
   * Find comment for formatting. If no comment, returns `null`
   * @param url Board URL
   * @param num Comment number on board
   */
  public async findCommentForFormatting(url: string, num: bigint): Promise<Comment | null> {
    const comment = (await this.prisma.comment.findFirst({
      include: { board: true, parent: true },
      where: { board: { url }, num }
    })) as Comment | null;

    return comment ?? null;
  }

  /**
   * Find count of thread replies by board URL and thread number
   * @param url Board URL
   * @param num Thread number on board
   */
  public async findRepliesCount(url: string, num: bigint): Promise<number> {
    return (await this.prisma.comment.count({
      where: { parent: { board: { url }, num, NOT: { lastHit: null } }, lastHit: null }
    })) as number;
  }

  /**
   * Find last comment (thread or reply) from IP
   * @param ip Poster's IP
   */
  public async findLastCommentByIp(ip: string): Promise<{ createdAt: Date } | null> {
    return (
      (await this.prisma.comment.findFirst({
        where: { ip },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })) ?? null
    );
  }

  /**
   * Find last thread from IP
   * @param ip Poster's IP
   */
  public async findLastThreadByIp(ip: string): Promise<Pick<Comment, 'createdAt'> | null> {
    return (
      (await this.prisma.comment.findFirst({
        where: { ip, parentId: null },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })) ?? null
    );
  }

  /**
   * Create new comment
   * @param url Board URL
   * @param input Comment creation input
   */
  public async createComment(url: string, input: Prisma.CommentCreateInput): Promise<CommentDto> {
    this.logger.info({ url, input }, 'createComment');

    await this.boardPersistenceService.incrementPostCount(url);

    input.num = await this.boardPersistenceService.getCurrentPostCount(url);

    const newComment = await this.prisma.comment.create({
      include: {
        parent: { include: { children: true } },
        attachedFile: true,
        board: { include: { boardSettings: true } },
        children: { include: { attachedFile: true }, orderBy: { createdAt: 'asc' } }
      },
      data: input
    });

    return this.commentMapper.toDto(newComment, newComment.children);
  }

  /**
   * Update thread last hit
   * @param url Board URL
   * @param num Thread number
   */
  public async updateThreadLastHit(url: string, num: bigint): Promise<void> {
    this.logger.info({ url, num }, 'updateThreadLastHit');

    const board = await this.boardPersistenceService.findByUrl(url);

    await this.prisma.comment.update({
      where: { boardId_num: { boardId: board.id, num }, NOT: { lastHit: null } },
      include: { board: true },
      data: { lastHit: new Date() }
    });
  }

  /**
   * Remove all comment from board
   * @param url Board URL
   */
  public async removeAllFromBoard(url: string): Promise<void> {
    this.logger.info({ url }, 'removeAllBy');

    await this.prisma.$transaction(async tx => {
      await tx.comment.deleteMany({ where: { board: { url } } });

      await this.attachedFilePersistenceService.removeOrphaned(url);
    });
  }

  /**
   * Remove thread with the oldest last hit on board
   * @param url Board URL
   */
  public async removeThreadWithOldestLastHit(url: string): Promise<void> {
    this.logger.info({ url }, 'removeThreadWithOldestLastHit');

    await this.prisma.$transaction(async tx => {
      const oldestThread = await tx.comment.findFirst({
        where: { NOT: { lastHit: null }, board: { url } },
        orderBy: { lastHit: 'asc' }
      });

      if (oldestThread) {
        await tx.comment.delete({ where: { id: oldestThread.id } });
      }

      await this.attachedFilePersistenceService.removeOrphaned(url);
    });
  }

  /**
   * Delete comments on board by comment nums and password.
   * @param url Board URL
   * @param nums List of comment nums
   * @param password User's password
   */
  public async removeByPassword(url: string, nums: bigint[], password: string): Promise<void> {
    this.logger.info({ url, password, nums }, 'removeByPassword');

    await this.prisma.$transaction(async tx => {
      await tx.comment.deleteMany({
        where: {
          board: { url },
          password,
          num: { in: nums }
        }
      });

      await this.attachedFilePersistenceService.removeOrphaned(url);
    });
  }

  /**
   * Remove all posts of current IP from board
   * @param url Board URL
   * @param ip Poster's Ip
   */
  public async removeByIp(url: string, ip: string): Promise<void> {
    this.logger.info({ url, ip }, 'removeByIp');

    await this.prisma.$transaction(async tx => {
      await tx.comment.deleteMany({ where: { board: { url }, ip } });
      await this.attachedFilePersistenceService.removeOrphaned(url);
    });
  }

  /**
   * Remove comment
   * @param url Board URL
   * @param num Thread number
   */
  public async remove(url: string, num: bigint): Promise<void> {
    this.logger.info({ url, num }, 'remove');

    await this.prisma.$transaction(async tx => {
      await tx.comment.deleteMany({ where: { board: { url }, num } });
      await this.attachedFilePersistenceService.removeOrphaned(url);
    });
  }
}
