import { Injectable } from '@nestjs/common';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { PageRequest } from '@persistence/lib/page';
import { CatalogPage } from '@posting/pages';
import { LOCALE } from '@locale/locale';

/**
 * Service for operation with catalog of threads
 */
@Injectable()
export class CatalogService {
  constructor(
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly boardPersistenceService: BoardPersistenceService
  ) {}

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
