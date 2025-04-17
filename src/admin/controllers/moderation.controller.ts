import {
  Body,
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
import { ListPage } from '@admin/pages';
import { BoardShortDto } from '@persistence/dto/board';
import { CommentModerationDto } from '@persistence/dto/comment/moderation';
import { formatDateTime } from '@library/page-compiler';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { ModerationDeletePostForm } from '@admin/forms/moderation';

@Controller('kashiwa/moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get()
  @UseGuards(SessionGuard)
  @Render('admin/moderation/admin-moderation-boards-list')
  public async getBoardsList(
    @Query(new ValidationPipe({ transform: true })) page: PageRequest,
    @Session() session: ISession
  ): Promise<ListPage<BoardShortDto>> {
    return await this.moderationService.getBoardsList(page, session);
  }

  @Get(':boardId')
  @UseGuards(SessionGuard)
  @Render('admin/moderation/admin-moderation-list')
  public async getCommentsList(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Query(new ValidationPipe({ transform: true })) page: PageRequest,
    @Session() session: ISession
  ): Promise<ListPage<CommentModerationDto> & { boardId: string; formatDateTime: (dateTime: Date) => string }> {
    const pageList = await this.moderationService.getCommentsList(boardId, page, session);

    return { ...pageList, boardId, formatDateTime };
  }

  @Post('delete-post/:commentId')
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async deletePost(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() form: ModerationDeletePostForm,
    @Res() res: Response
  ): Promise<void> {
    await this.moderationService.deletePost(commentId, form, res);
  }
}
