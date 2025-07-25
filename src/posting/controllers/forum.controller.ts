import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { FileSystemProvider } from '@library/providers';
import { Response } from 'express';
import * as fsExtra from 'fs-extra';
import { Constants } from '@library/constants';

@Controller()
export class ForumController {
  constructor(private readonly fileSystem: FileSystemProvider) {}

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
    const [stream] = this.fileSystem.streamFile([url, file]);
    return this.toStreamableFile(res, stream);
  }

  private streamFile(url: string, dir: string, file: string, res: Response): StreamableFile {
    const [stream, mime] = this.fileSystem.streamFile([url, dir, file]);
    return this.toStreamableFile(res, stream, mime);
  }

  private toStreamableFile(res: Response, stream: fsExtra.ReadStream, mime = 'text/html'): StreamableFile {
    res.set({
      'Content-Type': mime
    });
    return new StreamableFile(stream);
  }
}
