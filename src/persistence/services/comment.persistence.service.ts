import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { CommentMapper } from '@persistence/mappers';
import { CommentDto } from '@persistence/dto/comment/common';
import { Comment, Prisma } from '@prisma/client';
import { BoardPersistenceService } from '@persistence/services/board.persistence.service';
import { Page, PageRequest } from '@persistence/lib/page';
import { ThreadCollapsedDto } from '@persistence/dto/comment/collapsed';

/**
 * Database queries for `Comment` model
 */
@Injectable()
export class CommentPersistenceService {
  private readonly logger: Logger = new Logger(CommentPersistenceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly commentMapper: CommentMapper
  ) {}

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
      throw new NotFoundException();
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
   * Create new comment
   * @param url Board URL
   * @param input Comment creation input
   */
  public async createComment(url: string, input: Prisma.CommentCreateInput): Promise<CommentDto> {
    this.logger.log(`createComment: url: ${url}, Comment: ${this.stringifyCommentInput(input)}`);

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
    const board = await this.boardPersistenceService.findByUrl(url);

    await this.prisma.comment.update({
      where: { boardId_num: { boardId: board.id, num }, NOT: { lastHit: null } },
      include: { board: true },
      data: { lastHit: new Date() }
    });
  }

  /**
   * Stringify comment creation input
   */
  private stringifyCommentInput(input: Prisma.CommentCreateInput): string {
    const pairs: string[] = [];

    for (const key of Object.keys(input)) {
      if (typeof input[key] === 'bigint') {
        pairs.push(`${key}: ${input[key].toString()}`);
      }

      if (typeof input[key] === 'object') {
        if (input[key] === null || input[key] === undefined) {
          pairs.push(`${key}: null`);
        } else {
          pairs.push(`${key}: ${this.stringifyCommentInput(input[key])}`);
        }
      }

      pairs.push(`${key}: "${input[key]}"}`);
    }

    return `{${pairs.join(',')}}`;
  }
}
