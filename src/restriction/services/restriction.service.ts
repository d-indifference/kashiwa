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

/**
 * Type for describing of Exception class
 */
type HttpExceptionType<T extends HttpException> = new (
  objectOrError?: any,
  descriptionOrOptions?: string | HttpExceptionOptions
) => T;

/**
 * Type of comment which will be restricted
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
  constructor(private readonly commentPersistenceService: CommentPersistenceService) {}

  /**
   * Apply posting restrictions
   * @param restrictionType Type of comment which will be restricted
   * @param ip Poster's IP
   * @param board Board DTO
   * @param form Thread / Reply creation form
   * @param isAdmin Is poster admin / moderator
   */
  public checkRestrictions(
    restrictionType: RestrictionType,
    ip: string,
    board: BoardDto,
    form: FormsType,
    isAdmin: boolean
  ): void {
    if (board.boardSettings === undefined) {
      throw new InternalServerErrorException('You can not create a post on board without any settings!');
    } else {
      const settings: BoardSettingsDto = board.boardSettings;
      this.applyRestrictions(restrictionType, ip, settings, form, isAdmin);
    }
  }

  /**
   * Restrictions predicate applying
   */
  private applyRestrictions(
    restrictionType: RestrictionType,
    ip: string,
    settings: BoardSettingsDto,
    form: FormsType,
    isAdmin: boolean
  ): void {
    this.checkRestriction(() => allowPosting(settings), 'This board is closed for posting.', ForbiddenException);
    this.checkRestriction(() => strictAnonymity(settings, form), 'Please stay anonymous on this board.');
    this.checkRestriction(
      () => maxStringFieldSize(settings, form),
      `'Name', 'Subject' & 'Email cannot be longer than ${settings.maxStringFieldSize} symbols.'`
    );
    this.checkRestriction(
      () => maxCommentSize(settings, form),
      `'Comment', cannot be longer than ${settings.maxCommentSize} symbols.'`
    );
    this.checkRestriction(() => forbiddenFiles(restrictionType, settings, form), 'File attachment is forbidden here.');
    this.checkRestriction(() => requiredFiles(restrictionType, settings, form), 'Please attach any file.');
    this.checkRestriction(() => allowedFileTypes(settings, form), 'Disallowed file type.');
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
}
