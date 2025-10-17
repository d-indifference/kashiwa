import { CommentDeleteService } from './comment.delete.service';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { Params } from 'nestjs-pino/params';
import { LOCALE } from '@locale/locale';
import { ReportType } from '@prisma/client';
import { CommentDeleteForm } from '@posting/forms';

describe('CommentDeleteService', () => {
  let commentPersistenceService: any;
  let attachedFilePersistenceService: any;
  let reportPersistenceService: any;
  let cachingProvider: any;
  let cache: any;
  let service: CommentDeleteService;

  beforeEach(() => {
    commentPersistenceService = { removeByPassword: jest.fn() };
    attachedFilePersistenceService = { clearByPassword: jest.fn() };
    reportPersistenceService = { create: jest.fn() };
    cachingProvider = { fullyReloadCache: jest.fn() };
    cache = { delKeyStartWith: jest.fn() };

    service = new CommentDeleteService(
      commentPersistenceService,
      attachedFilePersistenceService,
      reportPersistenceService,
      cachingProvider,
      cache,
      new PinoLogger({} as Params)
    );

    jest.clearAllMocks();
  });

  describe('deleteComment', () => {
    it('should delete comment and redirect to thread when num provided and not deleted', async () => {
      const form = {
        fileOnly: false,
        delete: [BigInt(2)],
        password: 'pass',
        submitType: LOCALE.DELETE
      } as CommentDeleteForm;
      const res = { redirect: jest.fn() };
      jest.spyOn(service as any, 'processCommentDeletion').mockResolvedValue(undefined);

      const url = 'board';
      const num = BigInt(1);

      await service.deleteComment(url, form, res as unknown as Response, num);

      expect(service['processCommentDeletion']).toHaveBeenCalledWith(url, form);
      expect(cachingProvider.fullyReloadCache).toHaveBeenCalledWith(url);
      expect(cache.delKeyStartWith).toHaveBeenCalledTimes(3);
      expect(res.redirect).toHaveBeenCalledWith(`/${url}/res/${num}.html#${num}`);
    });

    it('should delete comment and redirect to start page when num in delete list and fileOnly is false', async () => {
      const form = {
        fileOnly: false,
        delete: [BigInt(42)],
        password: 'pass',
        submitType: LOCALE.DELETE
      } as CommentDeleteForm;
      const res = { redirect: jest.fn() };
      jest.spyOn(service as any, 'processCommentDeletion').mockResolvedValue(undefined);

      const url = 'board';
      const num = BigInt(42);

      await service.deleteComment(url, form, res as unknown as Response, num);

      expect(service['processCommentDeletion']).toHaveBeenCalledWith(url, form);
      expect(res.redirect).toHaveBeenCalledWith(`/${url}/kashiwa.html}`);
    });

    it('should delete comment and redirect to board start page when num is not provided', async () => {
      const form = {
        fileOnly: false,
        delete: [BigInt(2)],
        password: 'pass',
        submitType: LOCALE.DELETE
      } as CommentDeleteForm;
      const res = { redirect: jest.fn() };
      jest.spyOn(service as any, 'processCommentDeletion').mockResolvedValue(undefined);

      const url = 'board';

      await service.deleteComment(url, form, res as unknown as Response);

      expect(service['processCommentDeletion']).toHaveBeenCalledWith(url, form);
      expect(res.redirect).toHaveBeenCalledWith(`/${url}/kashiwa.html`);
    });

    it('should process reporting when submitType is REPORT and fileOnly = false (COMMENT type)', async () => {
      const form = {
        fileOnly: false,
        delete: [BigInt(1), BigInt(2)],
        password: '123',
        submitType: LOCALE.REPORT
      } as CommentDeleteForm;
      const res = { redirect: jest.fn() };
      jest.spyOn(service as any, 'processCommentReporting').mockResolvedValue(undefined);

      const url = 'board';
      await service.deleteComment(url, form, res as unknown as Response);

      expect(service['processCommentReporting']).toHaveBeenCalledWith(url, form);
      expect(cache.delKeyStartWith).toHaveBeenCalledTimes(3);
      expect(res.redirect).toHaveBeenCalledWith(`/${url}/kashiwa.html`);
    });
  });

  describe('processCommentDeletion', () => {
    it('should call clearByPassword when fileOnly is true', async () => {
      const form = { fileOnly: true, delete: [BigInt(5)], password: '123' } as CommentDeleteForm;
      await service['processCommentDeletion']('board', form);
      expect(attachedFilePersistenceService.clearByPassword).toHaveBeenCalledWith('board', [BigInt(5)], '123');
      expect(commentPersistenceService.removeByPassword).not.toHaveBeenCalled();
    });

    it('should call removeByPassword when fileOnly is false', async () => {
      const form = { fileOnly: false, delete: [BigInt(6)], password: 'abc' } as CommentDeleteForm;
      await service['processCommentDeletion']('board', form);
      expect(commentPersistenceService.removeByPassword).toHaveBeenCalledWith('board', [BigInt(6)], 'abc');
      expect(attachedFilePersistenceService.clearByPassword).not.toHaveBeenCalled();
    });
  });

  describe('makeRedirectionString', () => {
    it('should redirect to start page if num is being deleted and fileOnly is false', () => {
      const form = { fileOnly: false, delete: [BigInt(10)], password: 'x' } as CommentDeleteForm;
      const result = service['makeRedirectionString']('b', form, BigInt(10));
      expect(result).toBe('/b/kashiwa.html}');
    });

    it('should redirect to thread if num not in delete list', () => {
      const form = { fileOnly: false, delete: [BigInt(5)], password: 'y' } as CommentDeleteForm;
      const result = service['makeRedirectionString']('b', form, BigInt(7));
      expect(result).toBe('/b/res/7.html#7');
    });

    it('should redirect to thread if fileOnly is true even if num is in delete list', () => {
      const form = { fileOnly: true, delete: [BigInt(3)], password: 'z' } as CommentDeleteForm;
      const result = service['makeRedirectionString']('c', form, BigInt(3));
      expect(result).toBe('/c/res/3.html#3');
    });
  });

  describe('processCommentReporting', () => {
    it('should create COMMENT report when fileOnly is false', async () => {
      const form = { fileOnly: false, delete: [BigInt(1)], password: '123' } as CommentDeleteForm;
      const url = 'board';
      await service['processCommentReporting'](url, form);
      expect(reportPersistenceService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          boardUrl: url,
          nums: [BigInt(1)],
          reportType: ReportType.COMMENT
        })
      );
    });

    it('should create FILE report when fileOnly is true', async () => {
      const form = { fileOnly: true, delete: [BigInt(2)], password: '123' } as CommentDeleteForm;
      const url = 'board';
      await service['processCommentReporting'](url, form);
      expect(reportPersistenceService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          boardUrl: url,
          nums: [BigInt(2)],
          reportType: ReportType.FILE
        })
      );
    });
  });
});
