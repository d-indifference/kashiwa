import { CommentPersistenceService } from './comment.persistence.service';
import { NotFoundException } from '@nestjs/common';
import { Page } from '@persistence/lib/page';

const prismaMock = {
  comment: {
    count: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
    delete: jest.fn()
  },
  $transaction: jest.fn()
};
const commentMapperMock = {
  toCollapsedDto: jest.fn(),
  toDto: jest.fn(),
  toModerationDto: jest.fn()
};
const boardPersistenceServiceMock = {
  incrementPostCount: jest.fn(),
  getCurrentPostCount: jest.fn(),
  findByUrl: jest.fn()
};
const attachedFilePersistenceServiceMock = {
  removeOrphaned: jest.fn()
};
const loggerMock = {
  setContext: jest.fn(),
  info: jest.fn()
};
const PageMock = {
  ofFilter: jest.fn()
};
const pageInstance = {
  content: [{}, {}],
  current: 1,
  total: 2,
  previous: null,
  next: null,
  map: jest.fn(function (mapper) {
    return {
      content: this.content.map(mapper),
      current: this.current,
      total: this.total,
      previous: this.previous,
      next: this.next,
      map: this.map
    };
  })
};
jest.mock('@persistence/lib/page', () => ({
  Page: {
    ofFilter: jest.fn()
  }
}));

const LOCALE = {
  THREAD_NOT_FOUND: (url, num) => `Thread ${num} on board ${url} not found`
};

describe('CommentPersistenceService', () => {
  let service: CommentPersistenceService;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async fn => fn(prismaMock));
    service = new CommentPersistenceService(
      prismaMock as any,
      commentMapperMock as any,
      boardPersistenceServiceMock as any,
      attachedFilePersistenceServiceMock as any,
      loggerMock as any
    );
  });

  it('should be defined and set logger context', () => {
    expect(service).toBeDefined();
    expect(loggerMock.setContext).toHaveBeenCalledWith('CommentPersistenceService');
  });

  describe('countAll', () => {
    it('should return comment count', async () => {
      prismaMock.comment.count.mockResolvedValueOnce(7);
      expect(await service.countAll()).toBe(7);
    });
  });

  describe('threadCount', () => {
    it('should return thread count for board', async () => {
      prismaMock.comment.count.mockResolvedValueOnce(3);
      expect(await service.threadCount('url')).toBe(3);
      expect(prismaMock.comment.count).toHaveBeenCalledWith({
        where: { board: { url: 'url' }, NOT: { lastHit: null } }
      });
    });
  });

  describe('findAll', () => {
    it('should return page of collapsed threads', async () => {
      jest.spyOn(Page, 'ofFilter').mockResolvedValueOnce(pageInstance);
      commentMapperMock.toCollapsedDto.mockImplementation(() => 'collapsedDto');
      const result = await service.findAll('boardId', { page: 1, limit: 10 });
      expect(result.content).toEqual(['collapsedDto', 'collapsedDto']);
    });
  });

  describe('findThreadNums', () => {
    it('should return thread numbers', async () => {
      prismaMock.comment.findMany.mockResolvedValueOnce([{ num: 1n }, { num: 2n }]);
      const result = await service.findThreadNums('url');
      expect(result).toEqual([1n, 2n]);
      expect(prismaMock.comment.findMany).toHaveBeenCalledWith({
        where: { board: { url: 'url' }, NOT: { lastHit: null } },
        select: { num: true }
      });
    });
  });

  describe('findManyForModeration', () => {
    it('should return page of moderation DTOs', async () => {
      jest.spyOn(Page, 'ofFilter').mockResolvedValueOnce(pageInstance);
      commentMapperMock.toModerationDto.mockImplementation(() => 'modDto');
      const result = await service.findManyForModeration('boardId', { page: 1, limit: 10 });
      expect(result.content).toEqual(['modDto', 'modDto']);
    });
  });

  describe('findManyForCatalog', () => {
    it('should return page of comment DTOs ordered by `createdAt`', async () => {
      jest.spyOn(Page, 'ofFilter').mockResolvedValueOnce(pageInstance);
      commentMapperMock.toDto.mockImplementation(() => ({ createdAt: new Date(), lastHit: new Date() }));
      const result = await service.findManyForCatalog('boardId', 'createdAt', { page: 1, limit: 10 });
      expect(result.content.length).toEqual(2);
      expect(Object.hasOwn(result.content[0], 'createdAt')).toBeTruthy();
      expect(Object.hasOwn(result.content[0], 'lastHit')).toBeTruthy();
    });

    it('should return page of comment DTOs ordered by `lastHit`', async () => {
      jest.spyOn(Page, 'ofFilter').mockResolvedValueOnce(pageInstance);
      commentMapperMock.toDto.mockImplementation(() => ({ createdAt: new Date(), lastHit: new Date() }));
      const result = await service.findManyForCatalog('boardId', 'lastHit', { page: 1, limit: 10 });
      expect(result.content.length).toEqual(2);
      expect(Object.hasOwn(result.content[0], 'createdAt')).toBeTruthy();
      expect(Object.hasOwn(result.content[0], 'lastHit')).toBeTruthy();
    });
  });

  describe('findThread', () => {
    it('should throw if not found', async () => {
      prismaMock.comment.findFirst.mockResolvedValueOnce(null);
      await expect(service.findThread('url', 5n)).rejects.toThrow(NotFoundException);
    });
    it('should return mapped dto if found', async () => {
      const comment = { children: [{}, {}] };
      prismaMock.comment.findFirst.mockResolvedValueOnce(comment);
      commentMapperMock.toDto.mockReturnValueOnce('dto');
      const result = await service.findThread('url', 1n);
      expect(result).toBe('dto');
      expect(commentMapperMock.toDto).toHaveBeenCalledWith(comment, comment.children);
    });
  });

  describe('findOpeningPost', () => {
    it('should throw if not found', async () => {
      prismaMock.comment.findFirst.mockResolvedValueOnce(null);
      await expect(service.findOpeningPost('url', 5n)).rejects.toThrow(NotFoundException);
    });
    it('should return mapped dto if found', async () => {
      const comment = {};
      prismaMock.comment.findFirst.mockResolvedValueOnce(comment);
      commentMapperMock.toDto.mockReturnValueOnce('dto');
      const result = await service.findOpeningPost('url', 1n);
      expect(result).toBe('dto');
      expect(commentMapperMock.toDto).toHaveBeenCalledWith(comment);
    });
  });

  describe('findCommentForFormatting', () => {
    it('should return comment if found', async () => {
      const comment = { id: 1 };
      prismaMock.comment.findFirst.mockResolvedValueOnce(comment);
      expect(await service.findCommentForFormatting('url', 2n)).toBe(comment);
    });
    it('should return null if not found', async () => {
      prismaMock.comment.findFirst.mockResolvedValueOnce(null);
      expect(await service.findCommentForFormatting('url', 2n)).toBeNull();
    });
  });

  describe('findRepliesCount', () => {
    it('should return replies count', async () => {
      prismaMock.comment.count.mockResolvedValueOnce(4);
      expect(await service.findRepliesCount('url', 1n)).toBe(4);
      expect(prismaMock.comment.count).toHaveBeenCalledWith({
        where: { parent: { board: { url: 'url' }, num: 1n, NOT: { lastHit: null } }, lastHit: null }
      });
    });
  });

  describe('findLastCommentByIp', () => {
    it('should return last comment date if found', async () => {
      prismaMock.comment.findFirst.mockResolvedValueOnce({ createdAt: new Date() });
      expect(await service.findLastCommentByIp('ip')).toHaveProperty('createdAt');
    });
    it('should return null if not found', async () => {
      prismaMock.comment.findFirst.mockResolvedValueOnce(null);
      expect(await service.findLastCommentByIp('ip')).toBeNull();
    });
  });

  describe('findLastThreadByIp', () => {
    it('should return last thread date if found', async () => {
      prismaMock.comment.findFirst.mockResolvedValueOnce({ createdAt: new Date() });
      expect(await service.findLastThreadByIp('ip')).toHaveProperty('createdAt');
    });
    it('should return null if not found', async () => {
      prismaMock.comment.findFirst.mockResolvedValueOnce(null);
      expect(await service.findLastThreadByIp('ip')).toBeNull();
    });
  });

  describe('createComment', () => {
    it('should increment post count, set num, create comment and return dto', async () => {
      boardPersistenceServiceMock.incrementPostCount.mockResolvedValueOnce(undefined);
      boardPersistenceServiceMock.getCurrentPostCount.mockResolvedValueOnce(42n);
      const input = {};
      const newComment = { children: [{}, {}] };
      prismaMock.comment.create.mockResolvedValueOnce(newComment);
      commentMapperMock.toDto.mockReturnValueOnce('dto');

      const result = await service.createComment('url', input as any);
      expect(boardPersistenceServiceMock.incrementPostCount).toHaveBeenCalledWith('url');
      expect(boardPersistenceServiceMock.getCurrentPostCount).toHaveBeenCalledWith('url');
      expect(prismaMock.comment.create).toHaveBeenCalled();
      expect(commentMapperMock.toDto).toHaveBeenCalledWith(newComment, newComment.children);
      expect(result).toBe('dto');
    });
  });

  describe('updateThreadLastHit', () => {
    it('should update thread lastHit and log success', async () => {
      loggerMock.info.mockClear();
      boardPersistenceServiceMock.findByUrl.mockResolvedValueOnce({ id: 'boardId' });
      prismaMock.comment.update.mockResolvedValueOnce({ id: 'cid' });

      await service.updateThreadLastHit('url', 10n);

      expect(loggerMock.info).toHaveBeenCalledWith({ url: 'url', num: 10n }, 'updateThreadLastHit');
      expect(prismaMock.comment.update).toHaveBeenCalledWith({
        where: { boardId_num: { boardId: 'boardId', num: 10n }, NOT: { lastHit: null } },
        include: { board: true },
        data: { lastHit: expect.any(Date) }
      });
      expect(loggerMock.info).toHaveBeenCalledWith({ id: 'cid' }, '[SUCCESS] updateThreadLastHit');
    });
  });

  describe('removeAllFromBoard', () => {
    it('should delete many comments, remove orphaned files and log', async () => {
      prismaMock.comment.deleteMany.mockResolvedValueOnce({ count: 7 });
      attachedFilePersistenceServiceMock.removeOrphaned.mockResolvedValueOnce(undefined);
      await service.removeAllFromBoard('url');
      expect(prismaMock.comment.deleteMany).toHaveBeenCalledWith({ where: { board: { url: 'url' } } });
      expect(attachedFilePersistenceServiceMock.removeOrphaned).toHaveBeenCalledWith('url');
      expect(loggerMock.info).toHaveBeenCalledWith({ count: 7 }, '[SUCCESS] removeAllFromBoard');
    });
  });

  describe('removeThreadWithOldestLastHit', () => {
    it('should remove oldest thread and orphaned files and return num', async () => {
      const oldestThread = { id: 't1', num: 99n };
      prismaMock.comment.findFirst.mockResolvedValueOnce(oldestThread);
      prismaMock.comment.delete.mockResolvedValueOnce(oldestThread);
      attachedFilePersistenceServiceMock.removeOrphaned.mockResolvedValueOnce(undefined);

      const result = await service.removeThreadWithOldestLastHit('url');
      expect(result).toBe(99n);
      expect(prismaMock.comment.delete).toHaveBeenCalledWith({ where: { id: 't1' } });
      expect(attachedFilePersistenceServiceMock.removeOrphaned).toHaveBeenCalledWith('url');
      expect(loggerMock.info).toHaveBeenCalledWith({ id: oldestThread.id }, '[SUCCESS] removeThreadWithOldestLastHit');
    });

    it('should return null if no oldest thread', async () => {
      prismaMock.comment.findFirst.mockResolvedValueOnce(null);
      attachedFilePersistenceServiceMock.removeOrphaned.mockResolvedValueOnce(undefined);
      const result = await service.removeThreadWithOldestLastHit('url');
      expect(result).toBeNull();
      expect(attachedFilePersistenceServiceMock.removeOrphaned).toHaveBeenCalledWith('url');
    });
  });

  describe('removeByPassword', () => {
    it('should delete comments, remove orphaned files and log', async () => {
      prismaMock.comment.deleteMany.mockResolvedValueOnce({ count: 2 });
      attachedFilePersistenceServiceMock.removeOrphaned.mockResolvedValueOnce(undefined);
      await service.removeByPassword('url', [1n, 2n], 'pass');
      expect(prismaMock.comment.deleteMany).toHaveBeenCalledWith({
        where: { board: { url: 'url' }, password: 'pass', num: { in: [1n, 2n] } }
      });
      expect(attachedFilePersistenceServiceMock.removeOrphaned).toHaveBeenCalledWith('url');
      expect(loggerMock.info).toHaveBeenCalledWith({ count: 2 }, '[SUCCESS] removeByPassword');
    });
  });

  describe('removeByIp', () => {
    it('should delete comments by IP, remove orphaned files and log', async () => {
      prismaMock.comment.deleteMany.mockResolvedValueOnce({ count: 3 });
      attachedFilePersistenceServiceMock.removeOrphaned.mockResolvedValueOnce(undefined);
      await service.removeByIp('url', 'ip');
      expect(prismaMock.comment.deleteMany).toHaveBeenCalledWith({ where: { board: { url: 'url' }, ip: 'ip' } });
      expect(attachedFilePersistenceServiceMock.removeOrphaned).toHaveBeenCalledWith('url');
      expect(loggerMock.info).toHaveBeenCalledWith({ count: 3 }, '[SUCCESS] removeByIp');
    });
  });

  describe('remove', () => {
    it('should delete comment, remove orphaned files and log', async () => {
      prismaMock.comment.deleteMany.mockResolvedValueOnce({ count: 1 });
      attachedFilePersistenceServiceMock.removeOrphaned.mockResolvedValueOnce(undefined);
      await service.remove('url', 7n);
      expect(prismaMock.comment.deleteMany).toHaveBeenCalledWith({ where: { board: { url: 'url' }, num: 7n } });
      expect(attachedFilePersistenceServiceMock.removeOrphaned).toHaveBeenCalledWith('url');
      expect(loggerMock.info).toHaveBeenCalledWith({ count: 1 }, '[SUCCESS] remove');
    });
  });
});
