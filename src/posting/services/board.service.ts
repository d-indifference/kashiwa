import { Injectable } from '@nestjs/common';
import { BoardPersistenceService } from '@persistence/services';
import { BoardPage } from '@posting/pages';

@Injectable()
export class BoardService {
  constructor(private readonly boardPersistenceService: BoardPersistenceService) {}

  public async getBoardPage(url: string): Promise<BoardPage> {
    const board = await this.boardPersistenceService.findByUrl(url);

    return new BoardPage(board);
  }
}
