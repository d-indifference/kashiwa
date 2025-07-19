import { Roles } from '@admin/decorators';
import { SessionGuard } from '@admin/guards';
import { BoardService } from '@admin/services';
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
import { FileAttachmentMode, UserRole } from '@prisma/client';
import { PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { TablePage } from '@admin/pages';
import { FormPage, RenderableSessionFormPage } from '@admin/lib';
import { BoardCreateForm, BoardUpdateForm } from '@admin/forms/board';
import { LOCALE } from '@locale/locale';
import { Constants } from '@library/constants';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';

@Controller('kashiwa/board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/common_table_page')
  public async getBoardList(
    @Query(new ValidationPipe({ transform: true })) page: PageRequest,
    @Session() session: ISession
  ): Promise<TablePage> {
    return await this.boardService.findAll(session, page);
  }

  @Get('new')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/common_form_page')
  public getBoardForm(@Session() session: ISession): RenderableSessionFormPage {
    const form = new BoardCreateForm();
    form.allowPosting = true;
    form.threadFileAttachmentMode = FileAttachmentMode.OPTIONAL;
    form.replyFileAttachmentMode = FileAttachmentMode.OPTIONAL;
    form.delayAfterThread = 30;
    form.delayAfterReply = 15;
    form.minFileSize = 1;
    form.maxFileSize = 3145728;
    form.allowMarkdown = true;
    form.allowTripcodes = true;
    form.maxThreadsOnBoard = 100;
    form.bumpLimit = 250;
    form.maxStringFieldSize = 100;
    form.maxCommentSize = 1000;
    form.defaultPosterName = LOCALE.ANONYMOUS as string;
    form.defaultModeratorName = LOCALE.MODERATOR as string;
    form.allowedFileTypes = Constants.SUPPORTED_FILE_TYPES.filter(t => t.startsWith('image/'));
    form.rules = LOCALE.RULES_DEFAULT as string;

    return FormPage.toSessionTemplateContent(session, form, {
      pageTitle: LOCALE.BOARDS as string,
      pageSubtitle: LOCALE.NEW_BOARD as string,
      goBack: '/kashiwa/board'
    });
  }

  @Get('edit/:id')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/board_form_page')
  public async getEditBoardForm(
    @Session() session: ISession,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<RenderableSessionFormPage & { boardId: string }> {
    return { ...(await this.boardService.getForUpdate(session, id)), boardId: id };
  }

  @Post('new')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async createBoard(
    @Body(new ValidationPipe({ transform: true, skipUndefinedProperties: false })) form: BoardCreateForm,
    @Res() res: Response
  ): Promise<void> {
    await this.boardService.create(form, res);
  }

  @Post('edit')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async updateBoard(
    @Body(new ValidationPipe({ transform: true, skipUndefinedProperties: false })) form: BoardUpdateForm,
    @Res() res: Response
  ): Promise<void> {
    await this.boardService.update(form, res);
  }

  @Post('reload/:id')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  public reloadBoardCache(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response): void {
    this.boardService.reloadBoardCache(id, res);
  }

  @Post('clear/:id')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  public async clearBoard(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.boardService.clearBoard(id, res);
  }

  @Post('delete/:id')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  public async deleteBoard(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.boardService.remove(id, res);
  }
}
