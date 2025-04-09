import { FileAttachmentMode } from '@prisma/client';

export class BoardSettingsDto {
  allowPosting: boolean;

  strictAnonymity: boolean;

  threadFileAttachmentMode: FileAttachmentMode;

  replyFileAttachmentMode: FileAttachmentMode;

  delayAfterThread: number;

  delayAfterReply: number;

  minFileSize: number;

  maxFileSize: number;

  allowMarkdown: boolean;

  allowTripcodes: boolean;

  maxThreadsOnBoard: number;

  bumpLimit: number;

  maxStringFieldSize: number;

  maxCommentSize: number;

  defaultPosterName: string;

  defaultModeratorName: string;

  enableCaptcha: boolean;

  isCaptchaCaseSensitive: boolean;

  allowedFileTypes: string[];

  rules: string;

  constructor(
    allowPosting: boolean,
    strictAnonymity: boolean,
    threadFileAttachmentMode: FileAttachmentMode,
    replyFileAttachmentMode: FileAttachmentMode,
    delayAfterThread: number,
    delayAfterReply: number,
    minFileSize: number,
    maxFileSize: number,
    allowMarkdown: boolean,
    allowTripcodes: boolean,
    maxThreadsOnBoard: number,
    bumpLimit: number,
    maxStringFieldSize: number,
    maxCommentSize: number,
    defaultPosterName: string,
    defaultModeratorName: string,
    enableCaptcha: boolean,
    isCaptchaCaseSensitive: boolean,
    allowedFileTypes: string[],
    rules: string
  ) {
    this.allowPosting = allowPosting;
    this.strictAnonymity = strictAnonymity;
    this.threadFileAttachmentMode = threadFileAttachmentMode;
    this.replyFileAttachmentMode = replyFileAttachmentMode;
    this.delayAfterThread = delayAfterThread;
    this.delayAfterReply = delayAfterReply;
    this.minFileSize = minFileSize;
    this.maxFileSize = maxFileSize;
    this.allowMarkdown = allowMarkdown;
    this.allowTripcodes = allowTripcodes;
    this.maxThreadsOnBoard = maxThreadsOnBoard;
    this.bumpLimit = bumpLimit;
    this.maxStringFieldSize = maxStringFieldSize;
    this.maxCommentSize = maxCommentSize;
    this.defaultPosterName = defaultPosterName;
    this.defaultModeratorName = defaultModeratorName;
    this.enableCaptcha = enableCaptcha;
    this.isCaptchaCaseSensitive = isCaptchaCaseSensitive;
    this.allowedFileTypes = allowedFileTypes;
    this.rules = rules;
  }
}
