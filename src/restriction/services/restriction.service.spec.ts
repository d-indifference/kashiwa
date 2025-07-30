import { RestrictionService, RestrictionType } from './restriction.service';
import { BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { BoardDto, BoardSettingsDto } from '@persistence/dto/board';
import { ReplyCreateForm, ThreadCreateForm } from '@posting/forms';

describe('RestrictionService', () => {
  let commentPersistenceService: any;
  let boardPersistenceService: any;
  let antiSpamService: any;
  let banService: any;
  let captchaSolvingPredicateProvider: any;
  let service: RestrictionService;

  const allowPosting = jest.fn();
  const allowedFileTypes = jest.fn();
  const forbiddenFiles = jest.fn();
  const requiredFiles = jest.fn();
  const maxCommentSize = jest.fn();
  const maxStringFieldSize = jest.fn();
  const strictAnonymity = jest.fn();

  const LOCALE = {
    YOU_CANNOT_CREATE_WITHOUT_BOARD_SETTINGS: 'No board settings',
    CAPTCHA_IS_INVALID: 'Invalid captcha',
    BOARD_IS_CLOSED: 'Board is closed',
    PLEASE_STAY_ANONYMOUS: 'Stay anonymous',
    FAILED_MAX_STRING_SIZE: (max: number) => `Max string size is ${max}`,
    FAILED_COMMENT_SIZE: (max: number) => `Max comment size is ${max}`,
    FORBIDDEN_FILES: 'Files forbidden',
    PLEASE_ATTACH_FILE: 'Please attach file',
    DISALLOWED_FILE_TYPE: 'Disallowed file type',
    TOO_FREQUENT_POSTING_THREADS: 'Too frequent threads',
    TOO_FREQUENT_POSTING: 'Too frequent replies'
  };

  beforeAll(() => {
    (global as any).LOCALE = LOCALE;
    jest.mock('@restriction/lib', () => ({
      allowPosting,
      allowedFileTypes,
      forbiddenFiles,
      requiredFiles,
      maxCommentSize,
      maxStringFieldSize,
      strictAnonymity
    }));
  });

  beforeEach(() => {
    commentPersistenceService = {
      findLastCommentByIp: jest.fn(),
      findLastThreadByIp: jest.fn()
    };
    boardPersistenceService = {
      findByUrl: jest.fn()
    };
    antiSpamService = { checkSpam: jest.fn() };
    banService = { checkBan: jest.fn() };
    captchaSolvingPredicateProvider = { isCaptchaSolved: jest.fn() };

    service = new RestrictionService(
      commentPersistenceService,
      boardPersistenceService,
      antiSpamService,
      banService,
      captchaSolvingPredicateProvider
    );
    jest.clearAllMocks();
  });

  describe('checkRestrictions', () => {
    it('should throw if boardSettings is undefined', async () => {
      boardPersistenceService.findByUrl.mockResolvedValue({ boardSettings: undefined });
      await expect(
        service.checkRestrictions(RestrictionType.THREAD, 'ip', 'url', {} as ThreadCreateForm | ReplyCreateForm, false)
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should call applyRestrictions if boardSettings exists', async () => {
      const board = { url: 'b', boardSettings: { enableCaptcha: false } };
      boardPersistenceService.findByUrl.mockResolvedValue(board);
      const spy = jest.spyOn(service as any, 'applyRestrictions').mockResolvedValue(undefined);

      await service.checkRestrictions(
        RestrictionType.THREAD,
        'ip',
        'url',
        {} as ThreadCreateForm | ReplyCreateForm,
        false
      );
      expect(spy).toHaveBeenCalledWith(RestrictionType.THREAD, 'ip', board, board.boardSettings, {}, false);
    });
  });

  describe('applyRestrictions', () => {
    it('should check captcha if enabled and throw on fail', async () => {
      const settings = { enableCaptcha: true };
      captchaSolvingPredicateProvider.isCaptchaSolved.mockResolvedValue(false);
      await expect(
        service['applyRestrictions'](
          RestrictionType.THREAD,
          'ip',
          { url: 'b' } as BoardDto,
          settings as BoardSettingsDto,
          { nya: 'n', captcha: 'c' } as ThreadCreateForm | ReplyCreateForm,
          false
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('should succeed if all restrictions pass and delays pass', async () => {
      const settings = {
        enableCaptcha: false,
        delayAfterThread: 2,
        delayAfterReply: 2,
        allowPosting: true,
        maxCommentSize: 1000
      };
      allowPosting.mockReturnValue(true);
      strictAnonymity.mockReturnValue(true);
      maxStringFieldSize.mockReturnValue(true);
      maxCommentSize.mockReturnValue(true);
      forbiddenFiles.mockReturnValue(true);
      requiredFiles.mockReturnValue(true);
      allowedFileTypes.mockReturnValue(true);
      banService.checkBan.mockResolvedValue(undefined);
      antiSpamService.checkSpam.mockReturnValue(undefined);
      commentPersistenceService.findLastCommentByIp.mockResolvedValue(null);
      commentPersistenceService.findLastThreadByIp.mockResolvedValue(null);

      await expect(
        service['applyRestrictions'](
          RestrictionType.THREAD,
          'ip',
          { url: 'b' } as BoardDto,
          settings as BoardSettingsDto,
          { comment: 'abcd', password: '12345678' } as ThreadCreateForm | ReplyCreateForm,
          false
        )
      ).resolves.toBeUndefined();

      await expect(
        service['applyRestrictions'](
          RestrictionType.REPLY,
          'ip',
          { url: 'b' } as BoardDto,
          settings as BoardSettingsDto,
          { comment: 'abcd', password: '12345678', sage: false } as ThreadCreateForm | ReplyCreateForm,
          false
        )
      ).resolves.toBeUndefined();
    });

    it('should throw ForbiddenException if allowPosting returns false', async () => {
      const settings = { enableCaptcha: false, allowPosting: false } as BoardSettingsDto;
      allowPosting.mockReturnValue(false);

      await expect(
        service['applyRestrictions'](
          RestrictionType.THREAD,
          'ip',
          { url: 'b' } as BoardDto,
          settings,
          {} as ThreadCreateForm | ReplyCreateForm,
          false
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if board is closed and exception is specified', async () => {
      const settings = { enableCaptcha: false } as BoardSettingsDto;
      allowPosting.mockReturnValue(false);

      await expect(
        service['applyRestrictions'](
          RestrictionType.THREAD,
          'ip',
          { url: 'b' } as BoardDto,
          settings,
          {} as ThreadCreateForm | ReplyCreateForm,
          false
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if strictAnonymity returns false', async () => {
      const settings = { enableCaptcha: false, allowPosting: true, strictAnonymity: false } as BoardSettingsDto;
      allowPosting.mockReturnValue(true);
      strictAnonymity.mockReturnValue(false);

      await expect(
        service['applyRestrictions'](
          RestrictionType.THREAD,
          'ip',
          { url: 'b' } as BoardDto,
          settings,
          { comment: 'abcd', password: '12345678' } as ThreadCreateForm | ReplyCreateForm,
          false
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if maxStringFieldSize returns false', async () => {
      const settings = { enableCaptcha: false, allowPosting: true, maxStringFieldSize: 3 } as BoardSettingsDto;
      allowPosting.mockReturnValue(true);
      strictAnonymity.mockReturnValue(true);
      maxStringFieldSize.mockReturnValue(false);

      await expect(
        service['applyRestrictions'](
          RestrictionType.THREAD,
          'ip',
          { url: 'b' } as BoardDto,
          settings,
          { name: 'abcd', comment: 'abcd', password: '12345678' } as ThreadCreateForm | ReplyCreateForm,
          false
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if antiSpamService.checkSpam throws', async () => {
      const settings = { enableCaptcha: false, allowPosting: true } as BoardSettingsDto;
      allowPosting.mockReturnValue(true);
      strictAnonymity.mockReturnValue(true);
      maxStringFieldSize.mockReturnValue(true);
      maxCommentSize.mockReturnValue(true);
      antiSpamService.checkSpam.mockImplementation(() => {
        throw new BadRequestException('spam');
      });

      await expect(
        service['applyRestrictions'](
          RestrictionType.THREAD,
          'ip',
          { url: 'b' } as BoardDto,
          settings,
          { name: 'abcd', comment: 'abcd', password: '12345678' } as ThreadCreateForm | ReplyCreateForm,
          false
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should check delays for thread and reply', async () => {
      const settings = {
        allowPosting: true,
        enableCaptcha: false,
        delayAfterThread: 1,
        delayAfterReply: 1
      } as BoardSettingsDto;
      allowPosting.mockReturnValue(true);
      strictAnonymity.mockReturnValue(true);
      maxStringFieldSize.mockReturnValue(true);
      maxCommentSize.mockReturnValue(true);
      forbiddenFiles.mockReturnValue(true);
      requiredFiles.mockReturnValue(true);
      allowedFileTypes.mockReturnValue(true);
      antiSpamService.checkSpam.mockReturnValue(undefined);
      banService.checkBan.mockResolvedValue(undefined);

      const now = new Date();
      commentPersistenceService.findLastThreadByIp.mockResolvedValue({ createdAt: now });
      commentPersistenceService.findLastCommentByIp.mockResolvedValue({ createdAt: now });

      await expect(
        service['applyRestrictions'](
          RestrictionType.THREAD,
          'ip',
          { url: 'b' } as BoardDto,
          settings,
          { comment: 'abcd', password: '12345678' } as ThreadCreateForm | ReplyCreateForm,
          false
        )
      ).rejects.toThrow(BadRequestException);

      await expect(
        service['applyRestrictions'](
          RestrictionType.REPLY,
          'ip',
          { url: 'b' } as BoardDto,
          settings,
          { comment: 'abcd', password: '12345678', sage: false } as ThreadCreateForm | ReplyCreateForm,
          false
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkRestriction', () => {
    it('should throw BadRequestException if restriction fails and no exception specified', () => {
      expect(() => service['checkRestriction'](() => false, 'fail')).toThrow(BadRequestException);
    });

    it('should throw specified exception if restriction fails', () => {
      expect(() => service['checkRestriction'](() => false, 'fail', ForbiddenException)).toThrow(ForbiddenException);
    });

    it('should not throw if restriction passes', () => {
      expect(() => service['checkRestriction'](() => true, 'ok')).not.toThrow();
    });
  });

  describe('checkRestrictionAsync', () => {
    it('should throw BadRequestException if restriction fails and no exception specified', async () => {
      await expect(service['checkRestrictionAsync'](async () => false, 'fail')).rejects.toThrow(BadRequestException);
    });

    it('should throw specified exception if restriction fails', async () => {
      await expect(service['checkRestrictionAsync'](async () => false, 'fail', ForbiddenException)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should not throw if restriction passes', async () => {
      await expect(service['checkRestrictionAsync'](async () => true, 'ok')).resolves.toBeUndefined();
    });
  });

  describe('delayPredicate', () => {
    it('should return true if dateOfComment is null', () => {
      expect(service['delayPredicate'](null, 10)).toBe(true);
    });

    it('should return true if delay is greater than delayTime', () => {
      const date = new Date(Date.now() - 20000);
      expect(service['delayPredicate']({ createdAt: date }, 10)).toBe(true);
    });

    it('should return false if delay is less than or equal to delayTime', () => {
      const date = new Date(Date.now() - 5000);
      expect(service['delayPredicate']({ createdAt: date }, 10)).toBe(false);
    });
  });

  describe('delayForReply', () => {
    it('should call delayPredicate with last comment by ip', async () => {
      const date = new Date(Date.now() - 20000);
      commentPersistenceService.findLastCommentByIp.mockResolvedValue({ createdAt: date });
      const result = await service['delayForReply']('ip', 10);
      expect(result).toBe(true);
    });
  });

  describe('delayForThread', () => {
    it('should call delayPredicate with last thread by ip', async () => {
      const date = new Date(Date.now() - 20000);
      commentPersistenceService.findLastThreadByIp.mockResolvedValue({ createdAt: date });
      const result = await service['delayForThread']('ip', 10);
      expect(result).toBe(true);
    });
  });
});
