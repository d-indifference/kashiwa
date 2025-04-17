import { Injectable } from '@nestjs/common';
import { BoardShortDto } from '@persistence/dto/board';
import { BoardPersistenceService } from '@persistence/services';
import { ListPage } from '@admin/pages';
import { PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';

@Injectable()
export class ModerationPageService {
  constructor(private readonly boardPersistenceService: BoardPersistenceService) {}

  public async getBoardsList(page: PageRequest, session: ISession): Promise<ListPage<BoardShortDto>> {
    const boards = await this.boardPersistenceService.findAll(page);

    return new ListPage(session, boards);
  }
}
