import { Controller, Get, Param, Render } from '@nestjs/common';
import { BoardService } from '@posting/services';
import { BoardPage } from '@posting/pages';

@Controller()
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get(':url')
  @Render('board')
  public async getBoard(@Param('url') url: string): Promise<BoardPage> {
    return await this.boardService.getBoardPage(url);
  }
}
