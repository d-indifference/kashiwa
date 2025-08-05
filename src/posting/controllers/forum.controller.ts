import { Controller, Get, HttpStatus, Param, Res, StreamableFile } from '@nestjs/common';
import { FileSystemProvider } from '@library/providers';
import { Response } from 'express';
import * as fsExtra from 'fs-extra';
import { Constants } from '@library/constants';
import { PinoLogger } from 'nestjs-pino';
import { LOCALE } from '@locale/locale';

@Controller()
export class ForumController {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(ForumController.name);
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

    stream.on('error', err => {
      this.logger.error({ ...err }, 'File reading error');
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).end(LOCALE.FILE_READING_ERROR as string);
      } else {
        res.destroy(err);
      }
    });

    res.on('close', () => {
      if (!stream.destroyed) {
        stream.destroy();
      }
    });

    return new StreamableFile(stream);
  }
}
