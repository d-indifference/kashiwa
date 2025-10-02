import { FileAttachmentMode } from '@prisma/client';

/**
 * DTO for board updating
 */
export class BoardUpdateDto {
  id: string;

  /**
   * Board URL path
   */
  url?: string;

  /**
   * Board Name
   */
  name?: string;

  /**
   * Is posting enabled
   */
  allowPosting?: boolean;

  /**
   * Disable Name & Email fields
   */
  strictAnonymity?: boolean;

  /**
   * Thread file attachment policy
   * `STRICT` - File is strictly required
   * `OPTIONAL` - File attachment is optional
   * `FORBIDDEN` - Files are strictly prohibited
   */
  threadFileAttachmentMode?: FileAttachmentMode;

  /**
   * Reply file attachment policy <br>
   * `STRICT` - File is strictly required <br>
   * `OPTIONAL` - File attachment is optional <br>
   * `FORBIDDEN` - Files are strictly prohibited
   */
  replyFileAttachmentMode?: FileAttachmentMode;

  /**
   * Delay between threads creations (seconds)
   */
  delayAfterThread?: number;

  /**
   * Delay between replies creations (seconds)
   */
  delayAfterReply?: number;

  /**
   * Minimal uploaded file size (bytes)
   */
  minFileSize?: number;

  /**
   * Maximal uploaded file size (bytes)
   */
  maxFileSize?: number;

  /**
   * Allow wakaba markdown.<br>
   * `true` - full wakaba markdown opportunities are enabled <br>
   * `false` - only replies (`>>123`), citations (`> test`) and links will be formated. <br>
   */
  allowMarkdown?: boolean;

  /**
   * Allow tripcode parsing
   */
  allowTripcodes?: boolean;

  /**
   * Maximum number of threads that can be on the board at the same time
   */
  maxThreadsOnBoard?: number;

  /**
   * Number of posts after which the thread will not rise
   */
  bumpLimit?: number;

  /**
   * Maximal size of Name, Email and subject fields
   */
  maxStringFieldSize?: number;

  /**
   * Maximal size of Comment field
   */
  maxCommentSize?: number;

  /**
   * Default poster name
   */
  defaultPosterName?: string;

  /**
   * Default moderator name
   */
  defaultModeratorName?: string;

  /**
   * Enable captcha
   */
  enableCaptcha?: boolean;

  /**
   * Set case sensitivity for captcha
   */
  isCaptchaCaseSensitive?: boolean;

  /**
   * List of supported file types for current board (MIME)
   */
  allowedFileTypes?: string[];

  /**
   * Can board threads start with an oekaki
   */
  allowOekakiThreads?: boolean;

  /**
   * Can replies contain an oekaki
   */
  allowOekakiReplies?: boolean;

  /**
   * HTML fragment with board rules
   */
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
    allowOekakiThreads: boolean | undefined,
    allowOekakiReplies: boolean | undefined,
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
    this.allowOekakiThreads = allowOekakiThreads;
    this.allowOekakiReplies = allowOekakiReplies;
    this.rules = rules;
  }
}
