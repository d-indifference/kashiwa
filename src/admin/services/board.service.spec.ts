import { BoardService } from './board.service';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { CachingProvider } from '@caching/providers';
import { TablePage } from '@admin/pages';
import { BoardCreateForm, BoardUpdateForm } from '@admin/forms/board';
import { BoardCreateDto, BoardDto, BoardSettingsDto, BoardShortDto, BoardUpdateDto } from '@persistence/dto/board';
import { Cookie } from 'express-session';
import { ISession, ISessionPayload } from '@admin/interfaces';
import { Page, PageRequest } from '@persistence/lib/page';
import { Board, FileAttachmentMode } from '@prisma/client';
import { Response } from 'express';
import { InMemoryCacheProvider } from '@library/providers';

describe('BoardService', () => {
  let service: BoardService;
  let boardPersistenceService: jest.Mocked<BoardPersistenceService>;
  let commentPersistenceService: jest.Mocked<CommentPersistenceService>;
  let cachingProvider: jest.Mocked<CachingProvider>;
  let cache: jest.Mocked<InMemoryCacheProvider>;
  let mockSession: any;
  let mockRes: any;

  beforeEach(() => {
    boardPersistenceService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      nullifyPostCount: jest.fn()
    } as any;
    commentPersistenceService = {
      removeAllFromBoard: jest.fn()
    } as any;
    cachingProvider = {
      createCache: jest.fn(),
      fullyReloadCache: jest.fn(),
      renameCache: jest.fn(),
      removeCache: jest.fn(),
      clearCache: jest.fn()
    } as any;
    cache = {
      delKeyStartWith: jest.fn()
    } as any;
    service = new BoardService(boardPersistenceService, commentPersistenceService, cachingProvider, cache);
    mockSession = {
      cookie: {} as Cookie,
      payload: { user: { id: 'user1' } } as unknown as ISessionPayload
    } as ISession;
    mockRes = { redirect: jest.fn() };
  });

  describe('findAll', () => {
    it('should return TablePage with boards', async () => {
      boardPersistenceService.findAll.mockResolvedValue({ content: [], total: 0 } as unknown as Page<BoardShortDto>);
      const pageRequest: PageRequest = { page: 1, limit: 10 };
      const result = await service.findAll(mockSession as ISession, pageRequest);
      expect(result).toBeInstanceOf(TablePage);
      expect(boardPersistenceService.findAll).toHaveBeenCalledWith(pageRequest);
    });
  });

  describe('getForUpdate', () => {
    it('should return RenderableSessionFormPage', async () => {
      const boardSettings = {
        allowPosting: true,
        strictAnonymity: false,
        threadFileAttachmentMode: FileAttachmentMode.OPTIONAL,
        replyFileAttachmentMode: FileAttachmentMode.OPTIONAL,
        delayAfterThread: 0,
        delayAfterReply: 0,
        minFileSize: 0,
        maxFileSize: 1000,
        allowMarkdown: true,
        allowTripcodes: true,
        maxThreadsOnBoard: 10,
        bumpLimit: 100,
        maxStringFieldSize: 100,
        maxCommentSize: 1000,
        defaultPosterName: 'anon',
        defaultModeratorName: 'mod',
        enableCaptcha: false,
        isCaptchaCaseSensitive: false,
        allowedFileTypes: ['jpg'],
        rules: 'rules'
      } as BoardSettingsDto;
      boardPersistenceService.findById.mockResolvedValue({
        id: 'id1',
        url: 'b',
        name: 'Board',
        boardSettings
      } as unknown as Board);
      const result = await service.getForUpdate(mockSession as ISession, 'id1');
      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('commons');
      expect(result).toHaveProperty('form');
    });
  });

  describe('create', () => {
    it('should create board, cache and redirect', async () => {
      const form = { url: 'b', name: 'Board', allowPosting: true } as any;
      const newBoard = { id: 'id1', url: 'b' };
      boardPersistenceService.create.mockResolvedValue(newBoard as Board);
      await service.create(form as BoardCreateForm, mockRes as Response);
      expect(boardPersistenceService.create).toHaveBeenCalledWith(expect.any(BoardCreateDto));
      expect(cachingProvider.createCache).toHaveBeenCalledWith('b');
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/board/edit/id1');
    });
  });

  describe('update', () => {
    it('should update board, reload and rename cache, and redirect', async () => {
      const form = { id: 'id1', url: 'b', name: 'Board', allowPosting: true } as any;
      const board = { id: 'id1', url: 'b' };
      const updatedBoard = { id: 'id1', url: 'b2' };
      boardPersistenceService.findById.mockResolvedValue(board as Board);
      boardPersistenceService.update.mockResolvedValue(updatedBoard as BoardDto);
      await service.update(form as BoardUpdateForm, mockRes as Response);
      expect(boardPersistenceService.findById).toHaveBeenCalledWith('id1');
      expect(boardPersistenceService.update).toHaveBeenCalledWith(expect.any(BoardUpdateDto));
      expect(cachingProvider.fullyReloadCache).toHaveBeenCalledWith('b');
      expect(cachingProvider.renameCache).toHaveBeenCalledWith('b', 'b2');
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/board/edit/id1');
    });
  });

  describe('remove', () => {
    it('should remove board and cache, then redirect', async () => {
      const board = { id: 'id1', url: 'b' };
      boardPersistenceService.findById.mockResolvedValue(board as Board);
      await service.remove('id1', mockRes as Response);
      expect(boardPersistenceService.findById).toHaveBeenCalledWith('id1');
      expect(boardPersistenceService.remove).toHaveBeenCalledWith('id1');
      expect(cachingProvider.removeCache).toHaveBeenCalledWith('b');
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/board');
    });
  });

  describe('reloadBoardCache', () => {
    it('should reload cache and redirect', async () => {
      const board = { id: 'id1', url: 'b' };
      boardPersistenceService.findById.mockResolvedValue(board as Board);
      await service.reloadBoardCache('id1', mockRes as Response);
      expect(boardPersistenceService.findById).toHaveBeenCalledWith('id1');
      expect(cachingProvider.fullyReloadCache).toHaveBeenCalledWith('b');
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/board/edit/id1');
    });
  });

  describe('clearBoard', () => {
    it('should clear board data, cache and redirect', async () => {
      const board = { id: 'id1', url: 'b' };
      boardPersistenceService.findById.mockResolvedValue(board as Board);
      await service.clearBoard('id1', mockRes as Response);
      expect(boardPersistenceService.findById).toHaveBeenCalledWith('id1');
      expect(boardPersistenceService.nullifyPostCount).toHaveBeenCalledWith('id1');
      expect(commentPersistenceService.removeAllFromBoard).toHaveBeenCalledWith('b');
      expect(cachingProvider.clearCache).toHaveBeenCalledWith('b');
      expect(cachingProvider.fullyReloadCache).toHaveBeenCalledWith('b');
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/board/edit/id1');
    });
  });
});
