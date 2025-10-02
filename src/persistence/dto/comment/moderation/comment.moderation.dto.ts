import { AttachedFileModerationDto } from '@persistence/dto/comment/moderation/attached-file.moderation.dto';

/**
 * DTO for comment with moderation panel info
 */
export class CommentModerationDto {
  /**
   * ID
   */
  id: string;

  /**
   * Poster's IP
   */
  ip: string;

  /**
   * Thread number on board
   */
  num: bigint;

  /**
   * Parent's thread number on board
   */
  parentNum: bigint;

  /**
   * Board URL
   */
  boardUrl: string;

  /**
   * Date of post creation
   */
  createdAt: Date;

  /**
   * Poster's name
   */
  name: string;

  /**
   * Poster's email
   */
  email: string | null;

  /**
   * Subject
   */
  subject: string | null;

  /**
   * Comment
   */
  comment: string;

  /**
   * Thread pinning date
   */
  pinnedAt: Date | null;

  /**
   * Check if posting in thread enabled (no effect for replies)
   */
  isPostingEnabled: boolean;

  /**
   * Attached File
   */
  attachedFile: AttachedFileModerationDto | null;

  constructor(
    id: string,
    ip: string,
    num: bigint,
    parentNum: bigint,
    boardUrl: string,
    createdAt: Date,
    name: string,
    email: string | null,
    subject: string | null,
    comment: string,
    pinnedAt: Date | null,
    isPostingEnabled: boolean,
    attachedFile: AttachedFileModerationDto | null
  ) {
    this.id = id;
    this.ip = ip;
    this.num = num;
    this.parentNum = parentNum;
    this.boardUrl = boardUrl;
    this.createdAt = createdAt;
    this.name = name;
    this.email = email;
    this.subject = subject;
    this.comment = comment;
    this.pinnedAt = pinnedAt;
    this.isPostingEnabled = isPostingEnabled;
    this.attachedFile = attachedFile;
  }
}
