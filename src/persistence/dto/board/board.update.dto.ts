import { FileAttachmentMode } from '@prisma/client';

export class BoardUpdateDto {
  id: string;

  url?: string;

  name?: string;

  allowPosting?: boolean;

  strictAnonymity?: boolean;

  threadFileAttachmentMode?: FileAttachmentMode;

  replyFileAttachmentMode?: FileAttachmentMode;

  delayAfterThread?: number;

  delayAfterReply?: number;

  minFileSize?: number;

  maxFileSize?: number;

  allowMarkdown?: boolean;

  allowTripcodes?: boolean;

  maxThreadsOnBoard?: number;

  bumpLimit?: number;

  maxStringFieldSize?: number;

  maxCommentSize?: number;

  defaultPosterName?: string;

  defaultModeratorName?: string;

  enableCaptcha?: boolean;

  isCaptchaCaseSensitive?: boolean;

  allowedFileTypes?: string[];

  rules?: string;

  constructor(
    id: string,
    url: string,
    name: string | undefined,
    allowPosting: boolean | undefined,
    strictAnonymity: boolean,
    threadFileAttachmentMode: FileAttachmentMode | undefined,
    replyFileAttachmentMode: FileAttachmentMode | undefined,
    delayAfterThread: number | undefined,
    delayAfterReply: number | undefined,
    minFileSize: number | undefined,
    maxFileSize: number | undefined,
    allowMarkdown: boolean | undefined,
    allowTripcodes: boolean | undefined,
    maxThreadsOnBoard: number | undefined,
    bumpLimit: number | undefined,
    maxStringFieldSize: number | undefined,
    maxCommentSize: number | undefined,
    defaultPosterName: string | undefined,
    defaultModeratorName: string | undefined,
    enableCaptcha: boolean | undefined,
    isCaptchaCaseSensitive: boolean | undefined,
    allowedFileTypes: string[] | undefined,
    rules: string | undefined
  ) {
    this.id = id;
    this.url = url;
    this.name = name;
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
