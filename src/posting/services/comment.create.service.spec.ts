import { CommentCreateService } from './comment.create.service';
import { BoardDto, BoardSettingsDto } from '@persistence/dto/board';
import { ReplyCreateForm, ThreadCreateForm } from '@posting/forms';
import { Response } from 'express';

describe('CommentCreateService', () => {
  let boardPersistenceService: any;
  let commentPersistenceService: any;
  let attachedFileService: any;
  let wakabaMarkdown: any;
  let cachingProvider: any;
  let service: CommentCreateService;

  jest.mock('@posting/lib/functions', () => ({
    setPostCookies: jest.fn().mockReturnValue(undefined),
    enrichName: jest.fn().mockReturnValue({ name: 'user', tripcode: null }),
    setPassword: jest.fn().mockReturnValue('hashedPwd')
  }));

  beforeEach(() => {
    boardPersistenceService = { findByUrl: jest.fn() };
    commentPersistenceService = {
      createComment: jest.fn(),
      findOpeningPost: jest.fn(),
      threadCount: jest.fn(),
      removeThreadWithOldestLastHit: jest.fn(),
      findRepliesCount: jest.fn(),
      updateThreadLastHit: jest.fn()
    };
    attachedFileService = { createAttachedFile: jest.fn() };
    wakabaMarkdown = { formatAsWakaba: jest.fn() };
    cachingProvider = {
      reloadCacheForThread: jest.fn(),
      removeThreadPage: jest.fn()
    };
    service = new CommentCreateService(
      boardPersistenceService,
      commentPersistenceService,
      attachedFileService,
      wakabaMarkdown,
      cachingProvider
    );
    jest.clearAllMocks();
  });

  describe('createThread', () => {
    it('creates thread, deletes oldest post if needed, reloads cache, sets cookies, and redirects', async () => {
      const board = {
        id: 1,
        url: 'b',
        boardSettings: { maxThreadsOnBoard: 2 }
      };
      boardPersistenceService.findByUrl.mockResolvedValue(board);
      const input = { foo: 'bar' };
      jest.spyOn(service as any, 'toThreadCreateInput').mockResolvedValue(input);
      const newThread = { num: 123 };
      commentPersistenceService.createComment.mockResolvedValue(newThread);
      jest.spyOn(service as any, 'deleteOldestPostOnMaxThreadsOnBoard').mockResolvedValue(undefined);
      cachingProvider.reloadCacheForThread.mockResolvedValue(undefined);

      const res = { redirect: jest.fn(), cookie: jest.fn().mockReturnValue(undefined) };

      await service.createThread(
        'b',
        { password: 'pass' } as ThreadCreateForm,
        '127.0.0.1',
        res as unknown as Response,
        false
      );

      expect(boardPersistenceService.findByUrl).toHaveBeenCalledWith('b');
      expect(service['toThreadCreateInput']).toHaveBeenCalledWith(board, { password: 'pass' }, '127.0.0.1', false);
      expect(commentPersistenceService.createComment).toHaveBeenCalledWith('b', input);
      expect(service['deleteOldestPostOnMaxThreadsOnBoard']).toHaveBeenCalledWith(board);
      expect(cachingProvider.reloadCacheForThread).toHaveBeenCalledWith('b', newThread.num);
      expect(res.redirect).toHaveBeenCalledWith('/b/res/123.html#123');
    });
  });

  describe('createReply', () => {
    it('creates reply, bumps thread, reloads cache, sets cookies, and redirects', async () => {
      const board = {
        id: 2,
        url: 'b',
        boardSettings: { bumpLimit: 2 }
      };
      boardPersistenceService.findByUrl.mockResolvedValue(board);
      const input = { password: 'pass', hasSage: false };
      jest.spyOn(service as any, 'toReplyCreateInput').mockResolvedValue(input);
      const newReply = { num: 456 };
      commentPersistenceService.createComment.mockResolvedValue(newReply);
      jest.spyOn(service as any, 'updateLastHit').mockResolvedValue(undefined);
      cachingProvider.reloadCacheForThread.mockResolvedValue(undefined);

      const setPostCookies = jest.fn();
      const res = { redirect: jest.fn(), cookie: jest.fn().mockReturnValue(undefined) };
      jest.mock('@posting/lib/functions', () => ({
        setPostCookies
      }));

      await service.createReply(
        'b',
        BigInt(111),
        { password: 'pass', sage: false } as ReplyCreateForm,
        '127.0.0.1',
        res as unknown as Response,
        false
      );

      expect(boardPersistenceService.findByUrl).toHaveBeenCalledWith('b');
      expect(service['toReplyCreateInput']).toHaveBeenCalledWith(
        board,
        BigInt(111),
        { password: 'pass', sage: false },
        '127.0.0.1',
        false
      );
      expect(commentPersistenceService.createComment).toHaveBeenCalledWith('b', input);
      expect(service['updateLastHit']).toHaveBeenCalledWith(board, { password: 'pass', sage: false }, BigInt(111));
      expect(cachingProvider.reloadCacheForThread).toHaveBeenCalledWith('b', BigInt(111));
      expect(res.redirect).toHaveBeenCalledWith('/b/res/111.html#456');
    });
  });

  describe('toThreadCreateInput', () => {
    it('should call toCommentCreateInput and set lastHit', async () => {
      const board = { id: 'abc', url: 'b', name: 'Random' };
      const form = { name: 'test', comment: 'hi', password: 'pwd' };
      const input = { foo: 'bar' };
      jest.spyOn(service as any, 'toCommentCreateInput').mockResolvedValue(input);
      const result = await service['toThreadCreateInput'](board, form, 'ip', false);
      expect(service['toCommentCreateInput']).toHaveBeenCalledWith(board, false, 'ip', form, false);
      expect(result.lastHit).toBeInstanceOf(Date);
    });
  });

  describe('toReplyCreateInput', () => {
    it('should call toCommentCreateInput and set parent', async () => {
      const board = { id: 'abc', url: 'b', name: 'Random' };
      const parentNum = BigInt(10);
      const form = { name: 'test', comment: 'hi', password: 'pwd', sage: false };
      const input = { foo: 'bar' };
      jest.spyOn(service as any, 'toCommentCreateInput').mockResolvedValue(input);
      commentPersistenceService.findOpeningPost.mockResolvedValue({ id: 'abc' });
      const result = await service['toReplyCreateInput'](board, parentNum, form, 'ip', false);
      expect(service['toCommentCreateInput']).toHaveBeenCalledWith(board, false, 'ip', form, form.sage);
      expect(commentPersistenceService.findOpeningPost).toHaveBeenCalledWith(board.url, parentNum);
      expect(result.parent).toEqual({ connect: { id: 'abc' } });
    });
  });

  describe('toCommentCreateInput', () => {
    it('should build input from all dependencies', async () => {
      const board = {
        id: 'abc',
        url: 'b',
        name: 'Random',
        boardSettings: { allowMarkdown: true } as BoardSettingsDto
      };
      const isAdmin = false;
      const ip = 'ip';
      const form = { name: 'user', comment: 'msg', password: 'pwd', email: '', subject: '', file: {} } as
        | ThreadCreateForm
        | ReplyCreateForm;
      attachedFileService.createAttachedFile.mockResolvedValue({ attachedFile: 'fileObj' });
      wakabaMarkdown.formatAsWakaba.mockResolvedValue('<p>msg</p>');
      const enrichName = jest.fn().mockReturnValue({ name: 'user', tripcode: 'trip' });
      const setPassword = jest.fn().mockReturnValue('hashedPwd');
      jest.mock('@posting/lib/functions', () => ({
        enrichName,
        setPassword
      }));

      const result = await service['toCommentCreateInput'](board, isAdmin, ip, form, false);
      expect(attachedFileService.createAttachedFile).toHaveBeenCalledWith(form.file, board.url);
      expect(wakabaMarkdown.formatAsWakaba).toHaveBeenCalledWith(form.comment, board.url, true, isAdmin);
      expect(result.name).toBe('user');
      expect(result.tripcode).toBe(null);
      expect(result.password).toBe('pwd');
      expect(result.attachedFile).toBe('fileObj');
      expect(result.board).toEqual({ connect: { id: 'abc' } });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.hasSage).toBe(false);
    });
  });

  describe('deleteOldestPostOnMaxThreadsOnBoard', () => {
    it('should delete oldest thread and remove cache if thread count exceeded', async () => {
      const board = { url: 'b', boardSettings: { maxThreadsOnBoard: 1 } } as BoardDto;
      commentPersistenceService.threadCount.mockResolvedValue(5);
      commentPersistenceService.removeThreadWithOldestLastHit.mockResolvedValue(101);
      cachingProvider.removeThreadPage.mockResolvedValue(undefined);

      await service['deleteOldestPostOnMaxThreadsOnBoard'](board);
      expect(commentPersistenceService.threadCount).toHaveBeenCalledWith('b');
      expect(commentPersistenceService.removeThreadWithOldestLastHit).toHaveBeenCalledWith('b');
      expect(cachingProvider.removeThreadPage).toHaveBeenCalledWith('b', 101);
    });

    it('should not remove cache if removeThreadWithOldestLastHit returns null', async () => {
      const board = { url: 'b', boardSettings: { maxThreadsOnBoard: 1 } } as BoardDto;
      commentPersistenceService.threadCount.mockResolvedValue(5);
      commentPersistenceService.removeThreadWithOldestLastHit.mockResolvedValue(null);

      await service['deleteOldestPostOnMaxThreadsOnBoard'](board);
      expect(cachingProvider.removeThreadPage).not.toHaveBeenCalled();
    });

    it('should do nothing if threadCount <= maxThreadsOnBoard', async () => {
      const board = { url: 'b', boardSettings: { maxThreadsOnBoard: 10 } } as BoardDto;
      commentPersistenceService.threadCount.mockResolvedValue(5);

      await service['deleteOldestPostOnMaxThreadsOnBoard'](board);
      expect(commentPersistenceService.removeThreadWithOldestLastHit).not.toHaveBeenCalled();
      expect(cachingProvider.removeThreadPage).not.toHaveBeenCalled();
    });

    it('should do nothing if boardSettings is undefined', async () => {
      const board = { url: 'b' } as BoardDto;
      await service['deleteOldestPostOnMaxThreadsOnBoard'](board);
      expect(commentPersistenceService.removeThreadWithOldestLastHit).not.toHaveBeenCalled();
    });
  });

  describe('updateLastHit', () => {
    it('should update thread last hit if getSageFromForm is true and childrenLength <= bumpLimit', async () => {
      const board = { url: 'b', boardSettings: { bumpLimit: 10 } } as BoardDto;
      const form = { email: '', sage: false } as ReplyCreateForm;
      commentPersistenceService.findRepliesCount.mockResolvedValue(5);
      jest.spyOn(service as any, 'getSageFromForm').mockReturnValue(true);

      await service['updateLastHit'](board, form, BigInt(1));
      expect(commentPersistenceService.updateThreadLastHit).toHaveBeenCalledWith('b', BigInt(1));
    });

    it('should not update thread last hit if getSageFromForm is false', async () => {
      const board = { id: 'abc', url: 'b', name: 'Random', boardSettings: { bumpLimit: 10 } as BoardSettingsDto };
      const form = { email: '', sage: false } as ReplyCreateForm;
      commentPersistenceService.findRepliesCount.mockResolvedValue(5);
      jest.spyOn(service as any, 'getSageFromForm').mockReturnValue(false);

      await service['updateLastHit'](board, form, BigInt(1));
      expect(commentPersistenceService.updateThreadLastHit).not.toHaveBeenCalled();
    });

    it('should not update thread last hit if childrenLength > bumpLimit', async () => {
      const board = { url: 'b', boardSettings: { bumpLimit: 2 } } as BoardDto;
      const form = { email: '', sage: false } as ReplyCreateForm;
      commentPersistenceService.findRepliesCount.mockResolvedValue(5);
      jest.spyOn(service as any, 'getSageFromForm').mockReturnValue(true);

      await service['updateLastHit'](board, form, BigInt(1));
      expect(commentPersistenceService.updateThreadLastHit).not.toHaveBeenCalled();
    });

    it('should do nothing if boardSettings is undefined', async () => {
      const board = { url: 'b' } as BoardDto;
      const form = { email: '', sage: false } as ReplyCreateForm;
      commentPersistenceService.findRepliesCount.mockResolvedValue(5);

      await service['updateLastHit'](board, form, BigInt(1));
      expect(commentPersistenceService.updateThreadLastHit).not.toHaveBeenCalled();
    });
  });

  describe('getSageFromForm', () => {
    it('should return true if email is not sage', () => {
      expect(service['getSageFromForm']({ email: 'hello', sage: true } as ReplyCreateForm)).toBe(true);
      expect(service['getSageFromForm']({ email: 'SAGE', sage: false } as ReplyCreateForm)).toBe(false);
      expect(service['getSageFromForm']({ email: 'sage', sage: false } as ReplyCreateForm)).toBe(false);
      expect(service['getSageFromForm']({ email: 'SaGe', sage: false } as ReplyCreateForm)).toBe(false);
    });

    it('should return true if no email and sage is false', () => {
      expect(service['getSageFromForm']({ sage: false } as ReplyCreateForm)).toBe(true);
    });

    it('should return false if no email and sage is true', () => {
      expect(service['getSageFromForm']({ sage: true } as ReplyCreateForm)).toBe(false);
    });
  });
});
