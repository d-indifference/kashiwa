import { Injectable } from '@nestjs/common';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { PageRequest } from '@persistence/lib/page';
import { CatalogPage } from '@posting/pages';

@Injectable()
export class CatalogService {
  constructor(
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly boardPersistenceService: BoardPersistenceService
  ) {}

  public async getCatalogPage(
    url: string,
    orderByField: 'createdAt' | 'lastHit',
    page: PageRequest
  ): Promise<CatalogPage> {
    const board = await this.boardPersistenceService.findByUrl(url);
    const comments = await this.commentPersistenceService.findManyForCatalog(url, orderByField, page);

    return { board, page: comments, commons: { pageTitle: `Catalog | ${board.name}`, pageSubtitle: 'Catalog' } };
  }
}
