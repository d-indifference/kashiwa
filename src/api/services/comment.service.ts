import { Injectable } from '@nestjs/common';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { CommentDto, CommentPageDto, PageRequestDto } from '@api/dto/v1';
import { CommentMapper } from '@api/mappers';
import { InMemoryCacheProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';

/**
 * Service for operations with `Comment` object
 */
@Injectable()
export class CommentService {
  constructor(
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly commentMapper: CommentMapper,
    private readonly cache: InMemoryCacheProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(CommentService.name);
  }

  /**
   * Find a thread with its replies.
   * If thread is not cached, finds it in database and then set it to cache.
   * If thread is not found in database, throws `NotFoundException`
   * @param url Board URL
   * @param num Thread number
   */
  public async findThread(url: string, num: bigint): Promise<CommentDto> {
    this.logger.debug({ url, num }, 'findThread');

    return await this.cache.getOrCache(`api.findThread:${url}:${num}`, async () => {
      const board = await this.boardPersistenceService.findByUrl(url);
      const thread = await this.commentPersistenceService.findThread(url, num);

      return this.commentMapper.toCommentApiDto(thread, board.url);
    });
  }

  /**
   * Find one post (thread or reply) by board URL and its number.
   * If the post is not cached, finds it in database and then set it to cache.
   * If the post is not found in database, throws `NotFoundException`
   * @param url Board URL
   * @param num Post number
   */
  public async findPost(url: string, num: bigint): Promise<CommentDto> {
    this.logger.debug({ url, num }, 'findPost');

    return await this.cache.getOrCache(`api.findPost:${url}:${num}`, async () => {
      const board = await this.boardPersistenceService.findByUrl(url);
      const comment = await this.commentPersistenceService.findPost(url, num);

      return this.commentMapper.toCommentApiDto(comment, board.url);
    });
  }

  /**
   * Find the page of opening posts by board URL and page request.
   * If the page is not cached, finds it in database and then set it to cache.
   * @param url Board URL
   * @param request Page requests
   */
  public async findThreadsPage(url: string, request: PageRequestDto): Promise<CommentPageDto> {
    this.logger.debug({ url, request }, 'findThreadsPage');

    return await this.cache.getOrCache(`api.findThreadsPage:${request.page}:${request.limit}`, async () => {
      const board = await this.boardPersistenceService.findByUrl(url);
      const comment = await this.commentPersistenceService.findAll(board.id, { ...request });

      return this.commentMapper.toApiPage(comment, board.url);
    });
  }
}
