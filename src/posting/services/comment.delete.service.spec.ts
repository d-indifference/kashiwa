import { CommentDeleteService } from './comment.delete.service';
import { Response } from 'express';

describe('CommentDeleteService', () => {
  let commentPersistenceService: any;
  let attachedFilePersistenceService: any;
  let cachingProvider: any;
  let service: CommentDeleteService;

  beforeEach(() => {
    commentPersistenceService = {
      removeByPassword: jest.fn()
    };
    attachedFilePersistenceService = {
      clearByPassword: jest.fn()
    };
    cachingProvider = {
      fullyReloadCache: jest.fn()
    };
    service = new CommentDeleteService(commentPersistenceService, attachedFilePersistenceService, cachingProvider);
    jest.clearAllMocks();
  });

  describe('deleteComment', () => {
    it('should delete comment, reload cache, and redirect to thread if num is provided and not deleted', async () => {
      const form = {
        fileOnly: false,
        delete: [BigInt(2)],
        password: 'pass'
      };
      const res = { redirect: jest.fn() };
      jest.spyOn(service as any, 'processCommentDeletion').mockResolvedValue(undefined);
      cachingProvider.fullyReloadCache.mockResolvedValue(undefined);

      const url = 'board';
      const num = BigInt(1);

      await service.deleteComment(url, form, res as unknown as Response, num);

      expect(service['processCommentDeletion']).toHaveBeenCalledWith(url, form);
      expect(cachingProvider.fullyReloadCache).toHaveBeenCalledWith(url);

      expect(res.redirect).toHaveBeenCalledWith(`/${url}/res/${num}.html#${num}`);
    });

    it('should delete comment, reload cache, and redirect to start page if num in delete list and fileOnly is false', async () => {
      const form = {
        fileOnly: false,
        delete: [BigInt(42)],
        password: 'pass'
      };
      const res = { redirect: jest.fn() };
      jest.spyOn(service as any, 'processCommentDeletion').mockResolvedValue(undefined);
      cachingProvider.fullyReloadCache.mockResolvedValue(undefined);

      const url = 'board';
      const num = BigInt(42);

      await service.deleteComment(url, form, res as unknown as Response, num);

      expect(res.redirect).toHaveBeenCalledWith(`/${url}/kashiwa.html}`);
    });

    it('should delete comment, reload cache, and redirect to start page if num is not provided', async () => {
      const form = {
        fileOnly: false,
        delete: [BigInt(2)],
        password: 'pass'
      };
      const res = { redirect: jest.fn() };
      jest.spyOn(service as any, 'processCommentDeletion').mockResolvedValue(undefined);
      cachingProvider.fullyReloadCache.mockResolvedValue(undefined);

      const url = 'board';

      await service.deleteComment(url, form, res as unknown as Response);

      expect(res.redirect).toHaveBeenCalledWith(`/${url}/kashiwa.html`);
    });
  });

  describe('processCommentDeletion', () => {
    it('should call clearByPassword if fileOnly is true', async () => {
      const form = {
        fileOnly: true,
        delete: [BigInt(5)],
        password: '123'
      };
      await service['processCommentDeletion']('board', form);
      expect(attachedFilePersistenceService.clearByPassword).toHaveBeenCalledWith('board', [BigInt(5)], '123');
      expect(commentPersistenceService.removeByPassword).not.toHaveBeenCalled();
    });

    it('should call removeByPassword if fileOnly is false', async () => {
      const form = {
        fileOnly: false,
        delete: [BigInt(6)],
        password: 'abc'
      };
      await service['processCommentDeletion']('board', form);
      expect(commentPersistenceService.removeByPassword).toHaveBeenCalledWith('board', [BigInt(6)], 'abc');
      expect(attachedFilePersistenceService.clearByPassword).not.toHaveBeenCalled();
    });
  });

  describe('makeRedirectionString', () => {
    it('should redirect to start page if num is being deleted and fileOnly is false', () => {
      const form = {
        fileOnly: false,
        delete: [BigInt(10)],
        password: 'x'
      };
      const url = 'b';
      const num = BigInt(10);
      const result = service['makeRedirectionString'](url, form, num);
      expect(result).toBe(`/${url}/kashiwa.html}`);
    });

    it('should redirect to thread page if num not in delete list', () => {
      const form = {
        fileOnly: false,
        delete: [BigInt(5)],
        password: 'y'
      };
      const url = 'b';
      const num = BigInt(7);
      const result = service['makeRedirectionString'](url, form, num);
      expect(result).toBe(`/${url}/res/${num}.html#${num}`);
    });

    it('should redirect to thread page if fileOnly is true even if num is in delete list', () => {
      const form = {
        fileOnly: true,
        delete: [BigInt(3)],
        password: 'z'
      };
      const url = 'c';
      const num = BigInt(3);
      const result = service['makeRedirectionString'](url, form, num);
      expect(result).toBe(`/${url}/res/${num}.html#${num}`);
    });
  });
});
