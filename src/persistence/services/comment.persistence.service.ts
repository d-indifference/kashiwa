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
    this.logger.debug('countAll');

    return (await this.prisma.comment.count()) as number;
  }

  /**
   * Get threads count on board
   * @param url board URL
   */
  public async threadCount(url: string): Promise<number> {
    this.logger.debug({ url }, 'threadCount');

    return (await this.prisma.comment.count({ where: { board: { url }, NOT: { lastHit: null } } })) as number;
  }

  /**
   * Get all threads with their replies and paginate them
   * @param boardId Board ID
   * @param page Page request
   */
  public async findAll(boardId: string, page: PageRequest): Promise<Page<ThreadCollapsedDto>> {
    this.logger.debug({ boardId, page }, 'findAll');

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
    this.logger.debug({ url }, 'findThreadNums');

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
    this.logger.debug({ boardId, page }, 'findManyForModeration');

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

  public async findManyForCatalog(
    url: string,
    orderByField: 'createdAt' | 'lastHit',
    page: PageRequest
  ): Promise<Page<CommentDto>> {
    this.logger.debug({ url, page, orderByField }, 'findManyForCatalog');

    const comments = await Page.ofFilter<
      Comment,
      Prisma.CommentWhereInput,
      Prisma.CommentOrderByWithAggregationInput,
      Prisma.CommentInclude
    >(
      this.prisma,
      'comment',
      page,
      { board: { url }, NOT: { lastHit: null } },
      { [orderByField]: 'desc' },
      { attachedFile: { include: { board: true } } }
    );

    return comments.map(c => this.commentMapper.toDto(c));
  }

  /**
   * Find full thread by board URL and thread number. If not found, throws 404.
   * @param url Board URL
   * @param num Thread number on board
   */
  public async findThread(url: string, num: bigint): Promise<CommentDto> {
    this.logger.debug({ url, num }, 'findThread');

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
   * Find comment by board URL and thread number. If not found, throws 404.
   * @param url Board URL
   * @param num Comment number on board
   */
  public async findPost(url: string, num: bigint): Promise<CommentDto> {
    this.logger.debug({ url, num }, 'findPost');

    const post = await this.prisma.comment.findFirst({
      include: {
        board: { include: { boardSettings: true } },
        attachedFile: true
      },
      where: { board: { url }, num }
    });

    if (!post) {
      throw new NotFoundException((LOCALE['POST_NOT_FOUND'] as CallableFunction)(url, num.toString()));
    }

    return this.commentMapper.toDto(post, []);
  }

  /**
   * Find opening post by board URL and thread number. If not found, throws 404.
   * @param url Board URL
   * @param num Thread number on board
   */
  public async findOpeningPost(url: string, num: bigint): Promise<CommentDto> {
    this.logger.debug({ url, num }, 'findOpeningPost');

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
    this.logger.debug({ url, num }, 'findCommentForFormatting');

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
    this.logger.debug({ url, num }, 'findRepliesCount');

    return (await this.prisma.comment.count({
      where: { parent: { board: { url }, num, NOT: { lastHit: null } }, lastHit: null }
    })) as number;
  }

  /**
   * Find last comment (thread or reply) from IP
   * @param ip Poster's IP
   */
  public async findLastCommentByIp(ip: string): Promise<{ createdAt: Date } | null> {
    this.logger.debug({ ip }, 'findLastCommentByIp');

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

    const batch = await this.prisma.comment.update({
      where: { boardId_num: { boardId: board.id, num }, NOT: { lastHit: null } },
      include: { board: true },
      data: { lastHit: new Date() }
    });

    this.logger.info({ id: batch.id }, '[SUCCESS] updateThreadLastHit');
  }

  /**
   * Remove all comment from board
   * @param url Board URL
   */
  public async removeAllFromBoard(url: string): Promise<void> {
    this.logger.info({ url }, 'removeAllFromBoard');

    const batch = await this.prisma.comment.deleteMany({ where: { board: { url } } });
    await this.attachedFilePersistenceService.removeOrphaned(url);
    this.logger.info({ count: batch.count }, '[SUCCESS] removeAllFromBoard');
  }

  /**
   * Remove thread with the oldest last hit on board
   * @param url Board URL
   */
  public async removeThreadWithOldestLastHit(url: string): Promise<bigint | null> {
    this.logger.info({ url }, 'removeThreadWithOldestLastHit');

    let removedThread: Comment | null = null;

    await this.prisma.$transaction(async tx => {
      const oldestThread = await tx.comment.findFirst({
        where: { NOT: { lastHit: null }, board: { url } },
        orderBy: { lastHit: 'asc' }
      });

      if (oldestThread) {
        const batch = await tx.comment.delete({ where: { id: oldestThread.id } });
        this.logger.info({ id: batch.id }, '[SUCCESS] removeThreadWithOldestLastHit');
        removedThread = oldestThread;
      }
    });

    await this.attachedFilePersistenceService.removeOrphaned(url);

    return removedThread ? removedThread['num'] : null;
  }

  /**
   * Delete comments on board by comment nums and password.
   * @param url Board URL
   * @param nums List of comment nums
   * @param password User's password
   */
  public async removeByPassword(url: string, nums: bigint[], password: string): Promise<void> {
    this.logger.info({ url, password, nums }, 'removeByPassword');

    const batch = await this.prisma.comment.deleteMany({
      where: {
        board: { url },
        password,
        num: { in: nums }
      }
    });

    await this.attachedFilePersistenceService.removeOrphaned(url);
    this.logger.info({ count: batch.count }, '[SUCCESS] removeByPassword');
  }

  /**
   * Remove all posts of current IP from board
   * @param url Board URL
   * @param ip Poster's Ip
   */
  public async removeByIp(url: string, ip: string): Promise<void> {
    this.logger.info({ url, ip }, 'removeByIp');

    const batch = await this.prisma.comment.deleteMany({ where: { board: { url }, ip } });
    await this.attachedFilePersistenceService.removeOrphaned(url);
    this.logger.info({ count: batch.count }, '[SUCCESS] removeByIp');
  }

  /**
   * Remove comment
   * @param url Board URL
   * @param num Thread number
   */
  public async remove(url: string, num: bigint): Promise<void> {
    this.logger.info({ url, num }, 'remove');

    const batch = await this.prisma.comment.deleteMany({ where: { board: { url }, num } });
    await this.attachedFilePersistenceService.removeOrphaned(url);
    this.logger.info({ count: batch.count }, '[SUCCESS] remove');
  }
}
