import { Injectable } from '@nestjs/common';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { PageRequest } from '@persistence/lib/page';
import { CatalogPage } from '@posting/pages';
import { LOCALE } from '@locale/locale';
import { PinoLogger } from 'nestjs-pino';

/**
 * Service for operation with catalog of threads
 */
@Injectable()
export class CatalogService {
  constructor(
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(CatalogService.name);
  }

  /**
   * Receive a page of catalog of threads
   * @param url Board URL
   * @param orderByField Field of comment for thread ordering (created at or last hit)
   * @param page Page request
   */
  public async getCatalogPage(
    url: string,
    orderByField: 'createdAt' | 'lastHit',
    page: PageRequest
  ): Promise<CatalogPage> {
    this.logger.debug({ url, orderByField, page }, 'getCatalogPage');

    const board = await this.boardPersistenceService.findByUrl(url);
    const comments = await this.commentPersistenceService.findManyForCatalog(url, orderByField, page);

    return {
      orderBy: orderByField,
      board,
      page: comments,
      commons: { pageTitle: `${LOCALE.CATALOG as string} | ${board.name}`, pageSubtitle: LOCALE.CATALOG as string }
    };
  }
}
