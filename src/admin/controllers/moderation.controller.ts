import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Render,
  Res,
  Session,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { ModerationService } from '@admin/services';
import { SessionGuard } from '@admin/guards';
import { PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { TablePage } from '@admin/pages';
import { Response } from 'express';
import { ParseBigintPipe } from '@library/pipes';
import { PinoLogger } from 'nestjs-pino';

@Controller('kashiwa/moderation')
export class ModerationController {
  constructor(
    private readonly moderationService: ModerationService,
    private readonly logger: PinoLogger
  ) {}

  @Get()
  @UseGuards(SessionGuard)
  @Render('admin/common_table_page')
  public async getBoardsList(
    @Query(new ValidationPipe({ transform: true })) page: PageRequest,
    @Session() session: ISession
  ): Promise<TablePage> {
    this.logger.debug({ page, session }, 'URL called: GET /kashiwa/moderation');

    return await this.moderationService.findBoardsForModeration(session, page);
  }

  @Get(':id')
  @UseGuards(SessionGuard)
  @Render('admin/common_table_page')
  public async getCommentsForModeration(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ValidationPipe({ transform: true })) page: PageRequest,
    @Session() session: ISession
  ): Promise<TablePage> {
    this.logger.debug({ page, session }, `URL called: GET /kashiwa/moderation/${id}`);

    return await this.moderationService.findCommentsForModeration(session, id, page);
  }

  @Post('toggle-post-pinning/:url/:num')
  @UseGuards(SessionGuard)
  public async togglePostPinning(
    @Param('url') url: string,
    @Param('num', ParseBigintPipe) num: bigint,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug(`URL called: POST /kashiwa/moderation/toggle-post-pinning/${url}/${num}`);

    await this.moderationService.toggleThreadPinning(url, num, res);
  }

  @Post('toggle-thread-posting/:url/:num')
  @UseGuards(SessionGuard)
  public async toggleThreadPosting(
    @Param('url') url: string,
    @Param('num', ParseBigintPipe) num: bigint,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug(`URL called: POST /kashiwa/moderation/toggle-thread-posting/${url}/${num}`);

    await this.moderationService.toggleThreadPosting(url, num, res);
  }

  @Post('delete-post/:url/:num')
  @UseGuards(SessionGuard)
  public async deletePost(
    @Param('url') url: string,
    @Param('num', ParseBigintPipe) num: bigint,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug(`URL called: POST /kashiwa/moderation/delete-post/${url}/${num}`);

    await this.moderationService.deleteComment(url, num, res);
  }

  @Post('delete-file/:url/:num')
  @UseGuards(SessionGuard)
  public async deleteFile(
    @Param('url') url: string,
    @Param('num', ParseBigintPipe) num: bigint,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug(`URL called: POST /kashiwa/moderation/delete-file/${url}/${num}`);

    await this.moderationService.clearFile(url, num, res);
  }

  @Post('delete-by-ip/:url/:ip')
  @UseGuards(SessionGuard)
  public async deleteByIp(@Param('url') url: string, @Param('ip') ip: string, @Res() res: Response): Promise<void> {
    this.logger.debug(`URL called: POST /kashiwa/moderation/delete-by-ip/${url}/${ip}`);

    await this.moderationService.deleteAllByIp(url, ip, res);
  }
}
