import { Injectable } from '@nestjs/common';
import { TableConstructor } from '@admin/lib';
import { BoardShortDto } from '@persistence/dto/board';
import {
  AttachedFilePersistenceService,
  BoardPersistenceService,
  CommentPersistenceService
} from '@persistence/services';
import { LOCALE } from '@locale/locale';
import { TablePage } from '@admin/pages';
import { PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { CommentModerationDto } from '@persistence/dto/comment/moderation';
import { moderationBoardTableConstructor, moderationCommentsTableConstructor } from '@admin/misc';
import { Response } from 'express';
import { CachingProvider } from '@caching/providers';
import { InMemoryCacheProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';

/**
 * Service for moderation operations
 */
@Injectable()
export class ModerationService {
  private readonly boardTableConstructor: TableConstructor<BoardShortDto>;

  private readonly commentsTableConstructor: TableConstructor<CommentModerationDto>;

  constructor(
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly attachedFilePersistenceService: AttachedFilePersistenceService,
    private readonly cachingProvider: CachingProvider,
    private readonly cache: InMemoryCacheProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(ModerationService.name);
    this.boardTableConstructor = moderationBoardTableConstructor;
    this.commentsTableConstructor = moderationCommentsTableConstructor;
  }

  /**
   * Get page of boards
   * @param page Page request
   * @param session Session data
   */
  public async findBoardsForModeration(session: ISession, page: PageRequest): Promise<TablePage> {
    this.logger.debug({ session, page }, 'findBoardsForModeration');

    const content = await this.boardPersistenceService.findAll(page);
    const table = this.boardTableConstructor.fromPage(content, '/kashiwa/moderation', true);
    return new TablePage(table, session, {
      pageTitle: LOCALE.MODERATION_PANEL as string,
      pageSubtitle: LOCALE.CHOOSE_A_BOARD as string
    });
  }

  /**
   * Get page of comments
   * @param session id
   * @param id Board ID
   * @param page Page request object
   */
  public async findCommentsForModeration(session: ISession, id: string, page: PageRequest): Promise<TablePage> {
    this.logger.debug({ session, id, page }, 'findCommentsForModeration');

    const comments = await this.commentPersistenceService.findManyForModeration(id, page);
    const table = this.commentsTableConstructor.fromPage(comments, `/kashiwa/moderation/${id}`, true);
    return new TablePage(table, session, {
      pageTitle: LOCALE.MODERATION_PANEL as string,
      pageSubtitle: LOCALE.COMMENTS_MODERATION as string
    });
  }

  /**
   * Delete comment by board URL and post number
   * @param url Board URL
   * @param num Post number
   * @param res `Express.js` response
   */
  public async deleteComment(url: string, num: bigint, res: Response): Promise<void> {
    this.logger.info({ url, num: num.toString() }, 'deleteComment');

    await this.commentPersistenceService.remove(url, num);
    await this.cachingProvider.fullyReloadCache(url);
    const board = await this.boardPersistenceService.findByUrl(url);
    this.cache.del(`api.findThread:${url}:${num}`);
    this.cache.del(`api.findPost:${url}:${num}`);
    this.cache.delKeyStartWith(`api.findThreadsPage:${board.url}`);

    res.redirect(`/kashiwa/moderation/${board.id}`);
  }

  /**
   * Clear file of comment by board URL and post number
   * @param url Board URL
   * @param num Post number
   * @param res `Express.js` response
   */
  public async clearFile(url: string, num: bigint, res: Response): Promise<void> {
    this.logger.info({ url, num: num.toString() }, 'clearFile');

    await this.attachedFilePersistenceService.clearFromComment(url, num);
    await this.cachingProvider.fullyReloadCache(url);
    const board = await this.boardPersistenceService.findByUrl(url);
    this.cache.del(`api.findThread:${url}:${num}`);
    this.cache.del(`api.findPost:${url}:${num}`);
    this.cache.delKeyStartWith(`api.findThreadsPage:${url}`);

    res.redirect(`/kashiwa/moderation/${board.id}`);
  }

  /**
   * Delete all comments by poster's IP
   * @param url Board URL
   * @param ip Poster's IP
   * @param res `Express.js` response
   */
  public async deleteAllByIp(url: string, ip: string, res: Response): Promise<void> {
    this.logger.info({ url, ip }, 'deleteAllByIp');

    await this.commentPersistenceService.removeByIp(url, ip);
    await this.cachingProvider.fullyReloadCache(url);
    const board = await this.boardPersistenceService.findByUrl(url);
    this.cache.delKeyStartWith(`api.findThread:${url}`);
    this.cache.delKeyStartWith(`api.findPost:${url}`);
    this.cache.delKeyStartWith(`api.findThreadsPage:${url}`);

    res.redirect(`/kashiwa/moderation/${board.id}`);
  }
}
