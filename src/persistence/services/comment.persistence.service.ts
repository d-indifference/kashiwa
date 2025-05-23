import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { CommentMapper } from '@persistence/mappers';
import { CommentDto } from '@persistence/dto/comment/common';
import { Comment, Prisma } from '@prisma/client';
import { BoardPersistenceService } from '@persistence/services/board.persistence.service';
import { Page, PageRequest } from '@persistence/lib/page';
import { ThreadCollapsedDto } from '@persistence/dto/comment/collapsed';
import { AttachedFilePersistenceService } from '@persistence/services/attached-file.persistence.service';
import { FilesystemOperator } from '@library/filesystem';
import { Constants } from '@library/constants';
import { CommentModerationDto } from '@persistence/dto/comment/moderation';
import { LOCALE } from '@locale/locale';
import { PinoLogger } from 'nestjs-pino';

/**
 * Database queries for `Comment` model
 */
@Injectable()
export class CommentPersistenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly commentMapper: CommentMapper,
    private readonly attachedFilePersistenceService: AttachedFilePersistenceService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(CommentPersistenceService.name);
  }

  /**
   * Find all comments and paginate them for thread preview page
   * @param boardId ID of board
   * @param page Page request
   */
  public async findAll(boardId: string, page: PageRequest): Promise<Page<ThreadCollapsedDto>> {
    const comments = await Page.ofFilter<
      Comment,
      Prisma.CommentWhereInput,
      Prisma.CommentOrderByWithAggregationInput,
      Prisma.CommentInclude
    >(this.prisma, 'comment', page, { boardId, lastHit: { not: null } }, { lastHit: 'desc' }, { attachedFile: true });

    return await this.commentMapper.mapBoardPage(comments);
  }

  /**
   * Find all thread numbers of board
   * @param url Board URL
   */
  public async findAllThreadNums(url: string): Promise<bigint[]> {
    const board = await this.boardPersistenceService.findByUrl(url);
    const result = await this.prisma.comment.findMany({
      select: { num: true },
      where: { boardId: board.id, NOT: { lastHit: null } }
    });

    return result.map(r => r.num);
  }

  /**
   * Find all comments ID on board
   * @param boardId Board ID
   */
  public async findAllCommentIds(boardId: string): Promise<string[]> {
    const ids = await this.prisma.comment.findMany({ select: { id: true }, where: { boardId } });

    return ids.map(comment => comment.id);
  }

  /**
   * Find full thread by board URL and thread number. If not found, throws 404.
   * @param url Board URL
   * @param num Thread number on board
   */
  public async findThread(url: string, num: bigint): Promise<CommentDto> {
    const openingPost = await this.prisma.comment.findFirst({
      include: { board: { include: { boardSettings: true } }, attachedFile: true },
      where: { board: { url }, num, NOT: { lastHit: null } }
    });

    if (!openingPost) {
      throw new NotFoundException((LOCALE['THREAD_NOT_FOUND'] as CallableFunction)(url, num.toString()));
    }

    const replies = await this.prisma.comment.findMany({
      where: { parentId: openingPost.id },
      include: { attachedFile: true },
      orderBy: { num: 'asc' }
    });

    return this.commentMapper.toDto(openingPost, openingPost.attachedFile, replies);
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

    if (comment) {
      return comment;
    }

    return null;
  }

  /**
   * Find comments by password, nums and board URL
   * @param url Board URL
   * @param nums Comments number on board
   * @param password Poster's password
   */
  public async findCommentUserDeletionCandidates(url: string, nums: bigint[], password: string): Promise<string[]> {
    const board = await this.boardPersistenceService.findByUrl(url);

    const comments = await this.prisma.comment.findMany({
      select: { id: true },
      where: { boardId: board.id, password, num: { in: nums } }
    });

    return comments.map(comment => comment.id);
  }

  /**
   * Find all comments and paginate them for moderation page
   * @param boardId ID of board
   * @param page Page request
   */
  public async findForModeration(boardId: string, page: PageRequest): Promise<Page<CommentModerationDto>> {
    const board = await this.boardPersistenceService.findShortDtoById(boardId);

    const comments = await Page.ofFilter<
      Comment,
      Prisma.CommentWhereInput,
      Prisma.CommentOrderByWithAggregationInput,
      Prisma.CommentInclude
    >(this.prisma, 'comment', page, { boardId }, { createdAt: 'desc' }, { attachedFile: true, parent: true });

    return comments.map(comment => this.commentMapper.toModerationDto(board, comment));
  }

  /**
   * Get actual threads count on board
   * @param boardId Board ID
   */
  public async getThreadsCount(boardId: string): Promise<number> {
    return (await this.prisma.comment.count({ where: { boardId, NOT: { lastHit: null }, parentId: null } })) as number;
  }

  /**
   * Find thread with the oldest last hit by board ID
   * @param boardId Board ID
   */
  public async findThreadIdWithOldestLastHit(boardId: string): Promise<string | null> {
    const comment = await this.prisma.comment.findFirst({
      where: { boardId, NOT: { lastHit: null } },
      orderBy: { lastHit: 'asc' },
      select: { id: true }
    });

    if (comment) {
      return comment.id;
    }

    return null;
  }

  /**
   * Find last comment (thread or reply) from this IP
   * @param ip Poster's IP
   */
  public async findLastCommentByIp(ip: string): Promise<{ createdAt: Date } | null> {
    const comment = await this.prisma.comment.findFirst({
      where: { ip },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    if (!comment) {
      return null;
    }

    return comment;
  }

  /**
   * Find last thread from this IP
   * @param ip Poster's IP
   */
  public async findLastThreadByIp(ip: string): Promise<Pick<Comment, 'createdAt'> | null> {
    const comment = await this.prisma.comment.findFirst({
      where: { ip, parentId: null },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    if (!comment) {
      return null;
    }

    return comment;
  }

  /**
   * Get all comments count
   */
  public async countAll(): Promise<number> {
    return (await this.prisma.comment.count()) as number;
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
      include: { attachedFile: true, board: true, children: true },
      data: input
    });

    return this.commentMapper.toDto(newComment, newComment.attachedFile, newComment.children);
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
   * Remove comment and its `AttachedFile` by ID
   * @param id Comment ID
   */
  public async removeCommentById(id: string): Promise<void> {
    this.logger.info({ id }, 'removeCommentById');

    const comment = await this.prisma.comment.findFirst({
      where: { id },
      include: { attachedFile: true, board: true }
    });

    if (comment) {
      if (comment.attachedFile) {
        await this.attachedFilePersistenceService.removeById(comment.attachedFile.id);
      }

      await FilesystemOperator.remove(comment.board.url, Constants.RES_DIR, `${comment.num}${Constants.HTML_SUFFIX}`);
      await this.prisma.comment.delete({ where: { id } });

      await this.removeOrphanReplies(comment.board.url);
    }
  }

  /**
   * Remove comment and its `AttachedFile` by IP
   * @param boardId Board ID
   * @param ip Poster's IP
   */
  public async removeAllCommentsByIp(boardId: string, ip: string): Promise<void> {
    this.logger.info({ ip }, 'removeAllCommentsByIp');

    const comments = await this.prisma.comment.findMany({ select: { id: true }, where: { ip, boardId } });

    for (const commentId of comments) {
      await this.removeCommentById(commentId.id);
    }
  }

  /**
   * Remove replies without opening post from databases with their files
   * @param url Board URL
   */
  public async removeOrphanReplies(url: string): Promise<void> {
    this.logger.info({ url }, 'removeOrphanReplies');
    const board = await this.boardPersistenceService.findByUrl(url);

    await this.prisma.comment.deleteMany({ where: { boardId: board.id, parentId: null, lastHit: null } });
    await this.attachedFilePersistenceService.removeOrphaned();
  }
}
