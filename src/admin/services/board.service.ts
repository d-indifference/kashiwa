import { ISession } from '@admin/interfaces';
import { Injectable } from '@nestjs/common';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { PageRequest } from '@persistence/lib/page';
import { TablePage } from '@admin/pages';
import { FormPage, RenderableSessionFormPage, TableConstructor } from '@admin/lib';
import { BoardCreateDto, BoardShortDto, BoardUpdateDto } from '@persistence/dto/board';
import { LOCALE } from '@locale/locale';
import { Constants } from '@library/constants';
import { BoardSettings } from '@prisma/client';
import { BoardCreateForm, BoardUpdateForm } from '@admin/forms/board';
import { Response } from 'express';
import { CachingProvider } from '@caching/providers';
import { InMemoryCacheProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';

/**
 * Service for working with boards
 */
@Injectable()
export class BoardService {
  private readonly tableConstructor: TableConstructor<BoardShortDto>;

  constructor(
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly cachingProvider: CachingProvider,
    private readonly cache: InMemoryCacheProvider,
    private readonly logger: PinoLogger
  ) {
    this.tableConstructor = new TableConstructor<BoardShortDto>()
      .mappedValue(
        LOCALE.URL as string,
        obj => `/<a href="/${obj.url}/kashiwa${Constants.HTML_SUFFIX}">${obj.url}</a>/`
      )
      .plainValue(LOCALE.NAME as string, 'name')
      .plainValue(LOCALE.LAST_POST_INDEX as string, 'postCount')
      .mappedValue(LOCALE.EDIT as string, obj => `[<a href="/kashiwa/board/edit/${obj.id}">Edit</a>]`);
    this.logger.setContext(BoardService.name);
  }

  /**
   * Get page of boards
   * @param page Page request
   * @param session Session data
   */
  public async findAll(session: ISession, page: PageRequest): Promise<TablePage> {
    this.logger.debug({ session, page }, 'findAll');

    const content = await this.boardPersistenceService.findAll(page);
    const table = this.tableConstructor.fromPage(content, '/kashiwa/board');
    return new TablePage(table, session, {
      pageTitle: LOCALE.BOARDS as string,
      pageSubtitle: LOCALE.BOARD_LIST as string
    });
  }

  /**
   * Get form for updating of board by its ID
   * @param session Session data
   * @param id Board's ID
   */
  public async getForUpdate(session: ISession, id: string): Promise<RenderableSessionFormPage> {
    this.logger.debug({ session, id }, 'getForUpdate');

    const board = await this.boardPersistenceService.findById(id);
    const boardSettings: BoardSettings = board['boardSettings'];

    const form = new BoardUpdateForm();
    form.id = board.id;
    form.url = board.url;
    form.name = board.name;
    form.allowPosting = boardSettings.allowPosting;
    form.strictAnonymity = boardSettings.strictAnonymity;
    form.threadFileAttachmentMode = boardSettings.threadFileAttachmentMode;
    form.replyFileAttachmentMode = boardSettings.replyFileAttachmentMode;
    form.delayAfterThread = boardSettings.delayAfterThread;
    form.delayAfterReply = boardSettings.delayAfterReply;
    form.minFileSize = boardSettings.minFileSize;
    form.maxFileSize = boardSettings.maxFileSize;
    form.allowMarkdown = boardSettings.allowMarkdown;
    form.allowTripcodes = boardSettings.allowTripcodes;
    form.maxThreadsOnBoard = boardSettings.maxThreadsOnBoard;
    form.bumpLimit = boardSettings.bumpLimit;
    form.maxStringFieldSize = boardSettings.maxStringFieldSize;
    form.maxCommentSize = boardSettings.maxCommentSize;
    form.defaultPosterName = boardSettings.defaultPosterName;
    form.defaultModeratorName = boardSettings.defaultModeratorName;
    form.enableCaptcha = boardSettings.enableCaptcha;
    form.isCaptchaCaseSensitive = boardSettings.isCaptchaCaseSensitive;
    form.allowedFileTypes = boardSettings.allowedFileTypes as string[];
    form.allowOekakiThreads = boardSettings.allowOekakiThreads;
    form.allowOekakiReplies = boardSettings.allowOekakiReplies;
    form.rules = boardSettings.rules;

    return FormPage.toSessionTemplateContent(session, form, {
      pageTitle: LOCALE.BOARDS as string,
      pageSubtitle: LOCALE.EDIT_BOARD as string,
      goBack: '/kashiwa/board'
    });
  }

  /**
   * Create new board and make its file catalogs
   * @param form Form data
   * @param res Express.js `res` object
   */
  public async create(form: BoardCreateForm, res: Response): Promise<void> {
    this.logger.info({ form }, 'create');

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
      form.allowOekakiThreads,
      form.allowOekakiReplies,
      form.rules
    );

    const newBoard = await this.boardPersistenceService.create(dto);
    await this.cachingProvider.createCache(newBoard.url);

    res.redirect(`/kashiwa/board/edit/${newBoard.id}`);
  }

  /**
   * Update board and rename board catalogs
   * @param form Form data
   * @param res Express.js `res` object
   */
  public async update(form: BoardUpdateForm, res: Response): Promise<void> {
    this.logger.info({ form }, 'create');

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
      form.allowOekakiThreads,
      form.allowOekakiReplies,
      form.rules
    );

    const updatedBoard = await this.boardPersistenceService.update(dto);
    await this.cachingProvider.fullyReloadCache(board.url);
    await this.cachingProvider.renameCache(board.url, updatedBoard.url);
    this.cache.delKeyStartWith(`api.findThread:${board.url}`);
    this.cache.delKeyStartWith(`api.findPost:${board.url}`);
    this.cache.delKeyStartWith(`api.findThreadsPage:${board.url}`);

    res.redirect(`/kashiwa/board/edit/${updatedBoard.id}`);
  }

  /**
   * Delete board
   * @param id Object ID
   * @param res Express.js `res` object
   */
  public async remove(id: string, res: Response): Promise<void> {
    const board = await this.boardPersistenceService.findById(id);

    await this.boardPersistenceService.remove(id);
    await this.cachingProvider.removeCache(board.url);
    this.cache.delKeyStartWith(`api.findThread:${board.url}`);
    this.cache.delKeyStartWith(`api.findPost:${board.url}`);
    this.cache.delKeyStartWith(`api.findThreadsPage:${board.url}`);

    res.redirect('/kashiwa/board');
  }

  /**
   * Reloads cached pages of all threads on board (form handler)
   * @param id Board ID
   * @param res `Express.js` response
   */
  public async reloadBoardCache(id: string, res: Response): Promise<void> {
    const board = await this.boardPersistenceService.findById(id);
    await this.cachingProvider.fullyReloadCache(board.url);
    this.cache.delKeyStartWith(`api.findThread:${board.url}`);
    this.cache.delKeyStartWith(`api.findPost:${board.url}`);
    this.cache.delKeyStartWith(`api.findThreadsPage:${board.url}`);

    res.redirect(`/kashiwa/board/edit/${id}`);
  }

  /**
   * Clear cached pages and files of all comments on board
   * @param id Board ID
   * @param res `Express.js` response
   */
  public async clearBoard(id: string, res: Response): Promise<void> {
    const board = await this.boardPersistenceService.findById(id);
    await this.boardPersistenceService.nullifyPostCount(id);
    await this.commentPersistenceService.removeAllFromBoard(board.url);
    await this.cachingProvider.clearCache(board.url);
    await this.cachingProvider.fullyReloadCache(board.url);
    this.cache.delKeyStartWith(`api.findThread:${board.url}`);
    this.cache.delKeyStartWith(`api.findPost:${board.url}`);
    this.cache.delKeyStartWith(`api.findThreadsPage:${board.url}`);

    res.redirect(`/kashiwa/board/edit/${id}`);
  }
}
