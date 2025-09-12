/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/require-await */

import { CommentService } from './comment.service';
import { NotFoundException } from '@nestjs/common';

const boardPersistenceServiceMock = {
  findByUrl: jest.fn()
};
const commentPersistenceServiceMock = {
  findThread: jest.fn(),
  findPost: jest.fn(),
  findAll: jest.fn()
};
const commentMapperMock = {
  toCommentApiDto: jest.fn(),
  toApiPage: jest.fn()
};
const cacheMock = {
  getOrCache: jest.fn()
};

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CommentService(
      commentPersistenceServiceMock as any,
      boardPersistenceServiceMock as any,
      commentMapperMock as any,
      cacheMock as any
    );
  });

  describe('findThread', () => {
    it('should return value from cache if present', async () => {
      cacheMock.getOrCache.mockResolvedValueOnce('cachedThreadDto');
      const result = await service.findThread('boardUrl', 1n);
      expect(cacheMock.getOrCache).toHaveBeenCalledWith('api.findThread:boardUrl:1', expect.any(Function));
      expect(result).toBe('cachedThreadDto');
    });

    it('should return value from persistence if not cached', async () => {
      cacheMock.getOrCache.mockImplementation(async (_key, cb) => cb());
      boardPersistenceServiceMock.findByUrl.mockResolvedValueOnce({ id: 'boardId', url: 'boardUrl' });
      commentPersistenceServiceMock.findThread.mockResolvedValueOnce('threadEntity');
      commentMapperMock.toCommentApiDto.mockReturnValueOnce('mappedThreadDto');

      const result = await service.findThread('boardUrl', 1n);

      expect(boardPersistenceServiceMock.findByUrl).toHaveBeenCalledWith('boardUrl');
      expect(commentPersistenceServiceMock.findThread).toHaveBeenCalledWith('boardUrl', 1n);
      expect(commentMapperMock.toCommentApiDto).toHaveBeenCalledWith('threadEntity', 'boardUrl');
      expect(result).toBe('mappedThreadDto');
    });

    it('should throw NotFoundException if persistence throws NotFound', async () => {
      cacheMock.getOrCache.mockImplementation(async (_key, cb) => cb());
      boardPersistenceServiceMock.findByUrl.mockResolvedValueOnce({ id: 'boardId', url: 'boardUrl' });
      commentPersistenceServiceMock.findThread.mockRejectedValueOnce(new NotFoundException('not found'));

      await expect(service.findThread('boardUrl', 1n)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findPost', () => {
    it('should return value from cache if present', async () => {
      cacheMock.getOrCache.mockResolvedValueOnce('cachedPostDto');
      const result = await service.findPost('boardUrl', 2n);
      expect(cacheMock.getOrCache).toHaveBeenCalledWith('api.findPost:boardUrl:2', expect.any(Function));
      expect(result).toBe('cachedPostDto');
    });

    it('should return value from persistence if not cached', async () => {
      cacheMock.getOrCache.mockImplementation(async (_key, cb) => cb());
      boardPersistenceServiceMock.findByUrl.mockResolvedValueOnce({ id: 'boardId', url: 'boardUrl' });
      commentPersistenceServiceMock.findPost.mockResolvedValueOnce('postEntity');
      commentMapperMock.toCommentApiDto.mockReturnValueOnce('mappedPostDto');

      const result = await service.findPost('boardUrl', 2n);

      expect(boardPersistenceServiceMock.findByUrl).toHaveBeenCalledWith('boardUrl');
      expect(commentPersistenceServiceMock.findPost).toHaveBeenCalledWith('boardUrl', 2n);
      expect(commentMapperMock.toCommentApiDto).toHaveBeenCalledWith('postEntity', 'boardUrl');
      expect(result).toBe('mappedPostDto');
    });

    it('should throw NotFoundException if persistence throws NotFound', async () => {
      cacheMock.getOrCache.mockImplementation(async (_key, cb) => cb());
      boardPersistenceServiceMock.findByUrl.mockResolvedValueOnce({ id: 'boardId', url: 'boardUrl' });
      commentPersistenceServiceMock.findPost.mockRejectedValueOnce(new NotFoundException('not found'));

      await expect(service.findPost('boardUrl', 2n)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findThreadsPage', () => {
    it('should return value from cache if present', async () => {
      cacheMock.getOrCache.mockResolvedValueOnce('cachedPageDto');
      const result = await service.findThreadsPage('boardUrl', { page: 1, limit: 10 });
      expect(cacheMock.getOrCache).toHaveBeenCalledWith('api.findThreadsPage:1:10', expect.any(Function));
      expect(result).toBe('cachedPageDto');
    });

    it('should return value from persistence if not cached', async () => {
      cacheMock.getOrCache.mockImplementation(async (_key, cb) => cb());
      boardPersistenceServiceMock.findByUrl.mockResolvedValueOnce({ id: 'boardId', url: 'boardUrl' });
      commentPersistenceServiceMock.findAll.mockResolvedValueOnce('commentPage');
      commentMapperMock.toApiPage.mockReturnValueOnce('mappedPageDto');

      const result = await service.findThreadsPage('boardUrl', { page: 1, limit: 10 });

      expect(boardPersistenceServiceMock.findByUrl).toHaveBeenCalledWith('boardUrl');
      expect(commentPersistenceServiceMock.findAll).toHaveBeenCalledWith('boardId', { page: 1, limit: 10 });
      expect(commentMapperMock.toApiPage).toHaveBeenCalledWith('commentPage', 'boardUrl');
      expect(result).toBe('mappedPageDto');
    });
  });
});
