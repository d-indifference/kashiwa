import { Injectable } from '@nestjs/common';
import { BoardPersistenceService } from '@persistence/services';
import { BoardCreateForm, BoardUpdateForm } from '@admin/forms/board';
import { Response } from 'express';
import { BoardCreateDto, BoardShortDto } from '@persistence/dto/board';
import { FilesystemOperator } from '@library/filesystem';
import { Constants } from '@library/constants';
import { PageRequest } from '@persistence/lib/page';
import { FormPage, ListPage } from '@admin/pages';
import { ISession } from '@admin/interfaces';
import { BoardSettings } from '@prisma/client';
import { getSupportedFileTypes } from '@admin/lib/helpers';
import { BoardUpdateDto } from '@persistence/dto/board/board.update.dto';

@Injectable()
export class BoardService {
  constructor(private readonly boardPersistenceService: BoardPersistenceService) {}

  public async findAll(session: ISession, page: PageRequest): Promise<ListPage<BoardShortDto>> {
    const content = await this.boardPersistenceService.findAll(page);

    return new ListPage(session, content);
  }

  public async getForUpdate(
    session: ISession,
    id: string
  ): Promise<FormPage<BoardUpdateForm & { getSupportedFileTypes: () => string[][] }>> {
    const board = await this.boardPersistenceService.findById(id);
    const boardSettings: BoardSettings = board['boardSettings'];

    const form = {
      id,
      url: board.url,
      name: board.name,
      allowPosting: boardSettings.allowPosting,
      strictAnonymity: boardSettings.strictAnonymity,
      threadFileAttachmentMode: boardSettings.threadFileAttachmentMode,
      replyFileAttachmentMode: boardSettings.replyFileAttachmentMode,
      delayAfterThread: boardSettings.delayAfterThread,
      delayAfterReply: boardSettings.delayAfterReply,
      minFileSize: boardSettings.minFileSize,
      maxFileSize: boardSettings.maxFileSize,
      allowMarkdown: boardSettings.allowMarkdown,
      allowTripcodes: boardSettings.allowTripcodes,
      maxThreadsOnBoard: boardSettings.maxThreadsOnBoard,
      bumpLimit: boardSettings.bumpLimit,
      maxStringFieldSize: boardSettings.maxStringFieldSize,
      maxCommentSize: boardSettings.maxCommentSize,
      defaultPosterName: boardSettings.defaultPosterName,
      defaultModeratorName: boardSettings.defaultModeratorName,
      enableCaptcha: boardSettings.enableCaptcha,
      isCaptchaCaseSensitive: boardSettings.isCaptchaCaseSensitive,
      allowedFileTypes: boardSettings.allowedFileTypes as string[],
      rules: boardSettings.rules
    };

    const content = { ...form, getSupportedFileTypes };

    return new FormPage(session, 'UPDATE', content);
  }

  public async create(form: BoardCreateForm, res: Response): Promise<void> {
    const dto = new BoardCreateDto(
      form.url,
      form.name,
      form.allowPosting,
      form.strictAnonymity,
      form.threadFileAttachmentMode,
      form.replyFileAttachmentMode,
      form.delayAfterThread,
      form.delayAfterReply,
      form.minFileSize,
      form.maxFileSize,
      form.allowMarkdown,
      form.allowTripcodes,
      form.maxThreadsOnBoard,
      form.bumpLimit,
      form.maxStringFieldSize,
      form.maxCommentSize,
      form.defaultPosterName,
      form.defaultModeratorName,
      form.enableCaptcha,
      form.isCaptchaCaseSensitive,
      form.allowedFileTypes,
      form.rules
    );

    const newBoard = await this.boardPersistenceService.create(dto);

    await FilesystemOperator.mkdir(dto.url, Constants.RES_DIR);
    await FilesystemOperator.mkdir(dto.url, Constants.SRC_DIR);
    await FilesystemOperator.mkdir(dto.url, Constants.THUMB_DIR);

    res.redirect(`/kashiwa/board/edit/${newBoard.id}`);
  }

  public async update(form: BoardUpdateForm, res: Response): Promise<void> {
    const board = await this.boardPersistenceService.findById(form.id);

    const dto = new BoardUpdateDto(
      form.id,
      form.url,
      form.name,
      form.allowPosting,
      form.strictAnonymity,
      form.threadFileAttachmentMode,
      form.replyFileAttachmentMode,
      form.delayAfterThread,
      form.delayAfterReply,
      form.minFileSize,
      form.maxFileSize,
      form.allowMarkdown,
      form.allowTripcodes,
      form.maxThreadsOnBoard,
      form.bumpLimit,
      form.maxStringFieldSize,
      form.maxCommentSize,
      form.defaultPosterName,
      form.defaultModeratorName,
      form.enableCaptcha,
      form.isCaptchaCaseSensitive,
      form.allowedFileTypes,
      form.rules
    );

    const updatedBoard = await this.boardPersistenceService.update(dto);

    await FilesystemOperator.renameDir([], board.url, updatedBoard.url);

    res.redirect(`/kashiwa/board/edit/${updatedBoard.id}`);
  }

  public async remove(id: string, res: Response): Promise<void> {
    const board = await this.boardPersistenceService.findById(id);

    await this.boardPersistenceService.remove(id);

    await FilesystemOperator.remove(board.url);

    res.redirect('/kashiwa/board');
  }
}
