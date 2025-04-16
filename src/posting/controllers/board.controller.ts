import { Controller, Get, Param, ParseIntPipe, Render, Res, StreamableFile } from '@nestjs/common';
import { BoardService } from '@posting/services';
import { BoardPage } from '@posting/pages';
import { Response } from 'express';
import { FilesystemOperator } from '@library/filesystem';
import { Constants } from '@library/constants';
import { PageRequest } from '@persistence/lib/page';

@Controller()
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get(':url')
  @Render('board')
  public async getBoard(@Param('url') url: string): Promise<BoardPage> {
    return await this.boardService.getBoardPage(url, new PageRequest(0));
  }

  @Get(`:url/${Constants.RES_DIR}/:page`)
  public getThread(
    @Param('url') url: string,
    @Param('page') page: string,
    @Res({ passthrough: true }) res: Response
  ): StreamableFile {
    return this.streamFile(url, Constants.RES_DIR, page, res);
  }

  @Get(`:url/${Constants.SRC_DIR}/:file`)
  public getAttachedFile(
    @Param('url') url: string,
    @Param('file') file: string,
    @Res({ passthrough: true }) res: Response
  ): StreamableFile {
    return this.streamFile(url, Constants.SRC_DIR, file, res);
  }

  @Get(`:url/${Constants.THUMB_DIR}/:file`)
  public getThumbnail(
    @Param('url') url: string,
    @Param('file') file: string,
    @Res({ passthrough: true }) res: Response
  ): StreamableFile {
    return this.streamFile(url, Constants.THUMB_DIR, file, res);
  }

  @Get(':url/:page')
  @Render('board')
  public async getBoardPaginated(
    @Param('url') url: string,
    @Param('page', ParseIntPipe) page: number
  ): Promise<BoardPage> {
    return await this.boardService.getBoardPage(url, new PageRequest(page));
  }

  private streamFile(url: string, dir: string, file: string, res: Response): StreamableFile {
    const [stream, mime] = FilesystemOperator.streamFile(url, dir, file);

    res.set({
      'Content-Type': mime
    });

    return new StreamableFile(stream);
  }
}
