import { BoardSettingsDto } from '@persistence/dto/board';
import { RestrictionType } from '@restriction/services';
import { FileAttachmentMode } from '@prisma/client';
import { ReplyCreateForm, ThreadCreateForm } from '@posting/forms';

export type FormsType = ThreadCreateForm | ReplyCreateForm;

/**
 * `allowPosting` param checking.
 */
export const allowPosting = (boardSettings: BoardSettingsDto): boolean => Boolean(boardSettings.allowPosting);

/**
 * `strictAnonymity` param checking.
 */
export const strictAnonymity = (boardSettings: BoardSettingsDto, form: FormsType): boolean => {
  if (boardSettings.strictAnonymity) {
    return !form.name && !form.email;
  }

  return true;
};

/**
 * `maxStringFieldSize` param checking.
 */
export const maxStringFieldSize = (boardSettings: BoardSettingsDto, form: FormsType): boolean =>
  (form.name ? form.name.length <= boardSettings.maxStringFieldSize : true) &&
  (form.email ? form.email.length <= boardSettings.maxStringFieldSize : true) &&
  (form.subject ? form.subject.length < boardSettings.maxStringFieldSize : true);

/**
 * `maxCommentSize` param checking.
 */
export const maxCommentSize = (boardSettings: BoardSettingsDto, form: FormsType): boolean =>
  form.comment.length <= boardSettings.maxCommentSize;

/**
 * `threadFileAttachmentMode / replyFileAttachmentMode === FileAttachmentMode.FORBIDDEN` param checking.
 */
export const forbiddenFiles = (
  restrictionType: RestrictionType,
  boardSettings: BoardSettingsDto,
  form: FormsType
): boolean => {
  if (form.file) {
    if (restrictionType === RestrictionType.THREAD) {
      if (boardSettings.threadFileAttachmentMode === FileAttachmentMode.FORBIDDEN) {
        return false;
      }
    }

    if (restrictionType === RestrictionType.REPLY) {
      if (boardSettings.replyFileAttachmentMode === FileAttachmentMode.FORBIDDEN) {
        return false;
      }
    }
  }

  return true;
};

/**
 * `threadFileAttachmentMode / replyFileAttachmentMode === FileAttachmentMode.STRICT` param checking.
 */
export const requiredFiles = (
  restrictionType: RestrictionType,
  boardSettings: BoardSettingsDto,
  form: FormsType
): boolean => {
  if (restrictionType === RestrictionType.THREAD) {
    if (boardSettings.threadFileAttachmentMode === FileAttachmentMode.STRICT) {
      return Boolean(form.file);
    }
    return true;
  }

  if (restrictionType === RestrictionType.REPLY) {
    if (boardSettings.replyFileAttachmentMode === FileAttachmentMode.STRICT) {
      return Boolean(form.file);
    }
    return true;
  }

  return false;
};

/**
 * `allowedFileTypes` param checking.
 */
export const allowedFileTypes = (boardSettings: BoardSettingsDto, form: FormsType): boolean => {
  if (form.file) {
    return boardSettings.allowedFileTypes.includes(form.file.mimetype);
  }

  return true;
};
