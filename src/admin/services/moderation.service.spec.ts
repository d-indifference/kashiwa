import { ModerationService } from './moderation.service';
import {
  BoardPersistenceService,
  CommentPersistenceService,
  AttachedFilePersistenceService
} from '@persistence/services';
import { CachingProvider } from '@caching/providers';
import { TablePage } from '@admin/pages';
import { Page, PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { Cookie } from 'express-session';
import { UserRole } from '@prisma/client';
import { BoardDto, BoardShortDto } from '@persistence/dto/board';
import { CommentModerationDto } from '@persistence/dto/comment/moderation';
import { Response } from 'express';
import { InMemoryCacheProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { Params } from 'nestjs-pino/params';

describe('ModerationService', () => {
  let service: ModerationService;
  let boardPersistenceService: jest.Mocked<BoardPersistenceService>;
  let commentPersistenceService: jest.Mocked<CommentPersistenceService>;
  let attachedFilePersistenceService: jest.Mocked<AttachedFilePersistenceService>;
  let cachingProvider: jest.Mocked<CachingProvider>;
  let cache: jest.Mocked<InMemoryCacheProvider>;
  let mockSession: ISession;
  let mockRes: any;

  beforeEach(() => {
    boardPersistenceService = {
      findAll: jest.fn(),
      findByUrl: jest.fn()
    } as any;
    commentPersistenceService = {
      findManyForModeration: jest.fn(),
      remove: jest.fn(),
      removeByIp: jest.fn()
    } as any;
    attachedFilePersistenceService = {
      clearFromComment: jest.fn()
    } as any;
    cachingProvider = {
      fullyReloadCache: jest.fn()
    } as any;
    cache = {
      del: jest.fn(),
      delKeyStartWith: jest.fn()
    } as any;
    service = new ModerationService(
      boardPersistenceService,
      commentPersistenceService,
      attachedFilePersistenceService,
      cachingProvider,
      cache,
      new PinoLogger({} as Params)
    );
    mockSession = { cookie: {} as Cookie, payload: { id: '1', role: UserRole.ADMINISTRATOR } };
    mockRes = { redirect: jest.fn() };
  });

  describe('findBoardsForModeration', () => {
    it('should return TablePage with boards', async () => {
      boardPersistenceService.findAll.mockResolvedValue({ content: [], total: 0 } as unknown as Page<BoardShortDto>);
      const pageRequest: PageRequest = { page: 1, limit: 10 };
      const result = await service.findBoardsForModeration(mockSession, pageRequest);
      expect(result).toBeInstanceOf(TablePage);
      expect(boardPersistenceService.findAll).toHaveBeenCalledWith(pageRequest);
    });
  });

  describe('findCommentsForModeration', () => {
    it('should return TablePage with comments', async () => {
      commentPersistenceService.findManyForModeration.mockResolvedValue({
        content: [],
        total: 0
      } as unknown as Page<CommentModerationDto>);
      const pageRequest: PageRequest = { page: 1, limit: 10 };
      const result = await service.findCommentsForModeration(mockSession, 'boardId', pageRequest);
      expect(result).toBeInstanceOf(TablePage);
      expect(commentPersistenceService.findManyForModeration).toHaveBeenCalledWith('boardId', pageRequest);
    });
  });

  describe('deleteComment', () => {
    it('should remove comment, reload cache, and redirect', async () => {
      commentPersistenceService.remove.mockResolvedValue(undefined);
      cachingProvider.fullyReloadCache.mockResolvedValue(undefined);
      boardPersistenceService.findByUrl.mockResolvedValue({ id: 'boardId' } as BoardDto);
      await service.deleteComment('b', 123n, mockRes as Response);
      expect(commentPersistenceService.remove).toHaveBeenCalledWith('b', 123n);
      expect(cachingProvider.fullyReloadCache).toHaveBeenCalledWith('b');
      expect(boardPersistenceService.findByUrl).toHaveBeenCalledWith('b');
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/moderation/boardId');
    });
  });

  describe('clearFile', () => {
    it('should clear file, reload cache, and redirect', async () => {
      attachedFilePersistenceService.clearFromComment.mockResolvedValue(undefined);
      cachingProvider.fullyReloadCache.mockResolvedValue(undefined);
      boardPersistenceService.findByUrl.mockResolvedValue({ id: 'boardId' } as BoardDto);
      await service.clearFile('b', 123n, mockRes as Response);
      expect(attachedFilePersistenceService.clearFromComment).toHaveBeenCalledWith('b', 123n);
      expect(cachingProvider.fullyReloadCache).toHaveBeenCalledWith('b');
      expect(boardPersistenceService.findByUrl).toHaveBeenCalledWith('b');
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/moderation/boardId');
    });
  });

  describe('deleteAllByIp', () => {
    it('should remove all by ip, reload cache, and redirect', async () => {
      commentPersistenceService.removeByIp.mockResolvedValue(undefined);
      cachingProvider.fullyReloadCache.mockResolvedValue(undefined);
      boardPersistenceService.findByUrl.mockResolvedValue({ id: 'boardId' } as BoardDto);
      await service.deleteAllByIp('b', '127.0.0.1', mockRes as Response);
      expect(commentPersistenceService.removeByIp).toHaveBeenCalledWith('b', '127.0.0.1');
      expect(cachingProvider.fullyReloadCache).toHaveBeenCalledWith('b');
      expect(boardPersistenceService.findByUrl).toHaveBeenCalledWith('b');
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/moderation/boardId');
    });
  });
});
