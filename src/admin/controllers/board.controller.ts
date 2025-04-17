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
import { SessionGuard } from '@admin/guards';
import { Roles } from '@admin/decorators';
import { UserRole } from '@prisma/client';
import { PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { FormPage, ListPage } from '@admin/pages';
import { BoardCreateForm } from '@admin/forms/board/board.create.form';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { getSupportedFileTypes } from '@admin/lib/helpers';
import { BoardService } from '@admin/services';
import { BoardShortDto } from '@persistence/dto/board';
import { BoardUpdateForm } from '@admin/forms/board';

@Controller('kashiwa/board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/board/admin-board-list')
  public async getBoardList(
    @Query(new ValidationPipe({ transform: true })) page: PageRequest,
    @Session() session: ISession
  ): Promise<ListPage<BoardShortDto>> {
    return await this.boardService.findAll(session, page);
  }

  @Get('new')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/board/admin-board-form')
  public getBoardForm(@Session() session: ISession): FormPage<{ getSupportedFileTypes: () => string[][] }> {
    return new FormPage(session, 'CREATE', { getSupportedFileTypes });
  }

  @Get('edit/:id')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/board/admin-board-form')
  public async getEditBoardForm(
    @Session() session: ISession,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<FormPage<BoardUpdateForm & { getSupportedFileTypes: () => string[][] }>> {
    return await this.boardService.getForUpdate(session, id);
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
  public async reloadBoard(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.boardService.reloadBoard(id, res);
  }

  @Post('clear/:id')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  public async clearBoardCache(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.boardService.clearBoardCache(id, res);
  }

  @Post('delete/:id')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  public async deleteBoard(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.boardService.remove(id, res);
  }
}
