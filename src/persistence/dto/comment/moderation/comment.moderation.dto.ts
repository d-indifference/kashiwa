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
  parentNum: bigint | null;

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
   * Attached File
   */
  attachedFile: AttachedFileModerationDto | null;

  constructor(
    id: string,
    ip: string,
    num: bigint,
    parentNum: bigint | null,
    boardUrl: string,
    createdAt: Date,
    name: string,
    email: string | null,
    subject: string | null,
    comment: string,
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
    this.attachedFile = attachedFile;
  }
}
