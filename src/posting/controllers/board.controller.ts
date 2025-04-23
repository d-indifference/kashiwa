import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { FilesystemOperator } from '@library/filesystem';
import { Constants } from '@library/constants';

@Controller()
export class BoardController {
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

  @Get(':url/:file')
  public getBoard(
    @Param('url') url: string,
    @Param('file') file: string,
    @Res({ passthrough: true }) res: Response
  ): StreamableFile {
    return this.streamBoardHtml(url, file, res);
  }

  private streamBoardHtml(url: string, file: string, res: Response): StreamableFile {
    const [stream] = FilesystemOperator.streamFile(url, file);

    res.set({
      'Content-Type': 'text/html'
    });

    return new StreamableFile(stream);
  }

  private streamFile(url: string, dir: string, file: string, res: Response): StreamableFile {
    const [stream, mime] = FilesystemOperator.streamFile(url, dir, file);

    res.set({
      'Content-Type': mime
    });

    return new StreamableFile(stream);
  }
}
