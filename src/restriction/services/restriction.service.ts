import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { CommentPersistenceService } from '@persistence/services';
import { BoardDto, BoardSettingsDto } from '@persistence/dto/board';
import { HttpExceptionOptions } from '@nestjs/common/exceptions/http.exception';
import {
  allowPosting,
  allowedFileTypes,
  forbiddenFiles,
  FormsType,
  maxCommentSize,
  maxStringFieldSize,
  requiredFiles,
  strictAnonymity
} from '@restriction/lib';
import { DateTime } from 'luxon';
import { AntiSpamService } from '@restriction/modules/antispam/services';
import { BanService } from '@restriction/services/ban.service';
import { CaptchaSolvingPredicateProvider } from '@captcha/providers';
import { LOCALE } from '@locale/locale';

/**
 * Type for describing of Exception class
 */
type HttpExceptionType<T extends HttpException> = new (
  objectOrError?: any,
  descriptionOrOptions?: string | HttpExceptionOptions
) => T;

/**
 * Type of comment, which will be restricted
 */
export enum RestrictionType {
  THREAD = 'THREAD',
  REPLY = 'REPLY'
}

/**
 * Service for providing posting restrictions
 */
@Injectable()
export class RestrictionService {
  constructor(
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly antiSpamService: AntiSpamService,
    private readonly banService: BanService,
    private readonly captchaSolvingPredicateProvider: CaptchaSolvingPredicateProvider
  ) {}

  /**
   * Apply posting restrictions
   * @param restrictionType Type of comment which will be restricted
   * @param ip Poster's IP
   * @param board Board DTO
   * @param form Thread / Reply creation form
   * @param isAdmin Is poster admin / moderator
   */
  public async checkRestrictions(
    restrictionType: RestrictionType,
    ip: string,
    board: BoardDto,
    form: FormsType,
    isAdmin: boolean
  ): Promise<void> {
    if (board.boardSettings === undefined) {
      throw new InternalServerErrorException(LOCALE['YOU_CANNOT_CREATE_WITHOUT_BOARD_SETTINGS']);
    } else {
      const settings: BoardSettingsDto = board.boardSettings;
      await this.applyRestrictions(restrictionType, ip, settings, form, isAdmin);
    }
  }

  /**
   * Restrictions predicate applying
   */
  private async applyRestrictions(
    restrictionType: RestrictionType,
    ip: string,
    settings: BoardSettingsDto,
    form: FormsType,
    isAdmin: boolean
  ): Promise<void> {
    if (settings.enableCaptcha) {
      await this.checkRestrictionAsync(
        async () => {
          return await this.captchaSolvingPredicateProvider.isCaptchaSolved(isAdmin, form.nya, form.captcha);
        },
        LOCALE['CAPTCHA_IS_INVALID'] as string,
        ForbiddenException
      );
    }

    this.checkRestriction(() => allowPosting(settings), LOCALE['BOARD_IS_CLOSED'] as string, ForbiddenException);
    await this.banService.checkBan(ip, isAdmin);
    this.checkRestriction(() => strictAnonymity(settings, form), LOCALE['PLEASE_STAY_ANONYMOUS'] as string);
    this.checkRestriction(
      () => maxStringFieldSize(settings, form),
      (LOCALE['FAILED_MAX_STRING_SIZE'] as CallableFunction)(settings.maxStringFieldSize)
    );
    this.checkRestriction(
      () => maxCommentSize(settings, form),
      (LOCALE['FAILED_COMMENT_SIZE'] as CallableFunction)(settings.maxCommentSize)
    );
    this.antiSpamService.checkSpam(form, isAdmin);
    this.checkRestriction(() => forbiddenFiles(restrictionType, settings, form), LOCALE['FORBIDDEN_FILES'] as string);
    this.checkRestriction(() => requiredFiles(restrictionType, settings, form), LOCALE['PLEASE_ATTACH_FILE'] as string);
    this.checkRestriction(() => allowedFileTypes(settings, form), LOCALE['DISALLOWED_FILE_TYPE'] as string);

    if (!isAdmin) {
      if (restrictionType === RestrictionType.THREAD) {
        await this.checkRestrictionAsync(async () => {
          return await this.delayForThread(ip, settings.delayAfterThread);
        }, LOCALE['TOO_FREQUENT_POSTING_THREADS'] as string);
      }

      if (restrictionType === RestrictionType.REPLY) {
        await this.checkRestrictionAsync(async () => {
          return await this.delayForReply(ip, settings.delayAfterReply);
        }, LOCALE['TOO_FREQUENT_POSTING'] as string);
      }
    }
  }

  /**
   * Apply restriction, if restriction is failed, throws exception
   */
  private checkRestriction<E extends HttpException>(
    restriction: () => boolean,
    message: string,
    exception?: HttpExceptionType<E>
  ): void {
    if (!restriction()) {
      if (!exception) {
        throw new BadRequestException(message);
      } else {
        throw new exception(message);
      }
    }
  }

  /**
   * Apply restriction, if restriction is failed, throws exception
   */
  private async checkRestrictionAsync<E extends HttpException>(
    restriction: () => Promise<boolean>,
    message: string,
    exception?: HttpExceptionType<E>
  ): Promise<void> {
    const restrictionResult = await restriction();
    if (!restrictionResult) {
      if (!exception) {
        throw new BadRequestException(message);
      } else {
        throw new exception(message);
      }
    }
  }

  /**
   * Template method for delay checking predicate
   * @param dateOfComment Date of last comment object from Prisma
   * @param delayTime Time of max delay from board settings
   */
  private delayPredicate(dateOfComment: { createdAt: Date } | null, delayTime: number): boolean {
    const now = new Date();

    if (dateOfComment) {
      const commentDate = DateTime.fromJSDate(dateOfComment.createdAt);
      const delay = DateTime.fromJSDate(now).diff(commentDate, 'seconds');

      return !(delay.seconds <= delayTime);
    }

    return true;
  }

  /* /**
   * Checking delay for reply creation
   * @param ip Poster's IP
   * @param delayTime Time of max delay from board settings
   */
  private delayForReply(ip: string, delayTime: number): Promise<boolean> {
    return Promise.resolve(false);
  }

  /**
   * Checking delay for thread creation
   * @param ip Poster's IP
   * @param delayTime Time of max delay from board settings
   */
  private delayForThread(ip: string, delayTime: number): Promise<boolean> {
    return Promise.resolve(false);
  }
}
