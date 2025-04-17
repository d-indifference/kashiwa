import { AttachedFileDto } from '@persistence/dto/comment/common/attached-file.dto';

/**
 * DTO for comment and its replies
 */
export class CommentDto {
  /**
   * Number on board
   */
  num: bigint;

  /**
   * Creation date
   */
  createdAt: Date;

  /**
   * Is comment written by admin
   */
  isAdmin: boolean;

  /**
   * Poster's name
   */
  name: string;

  /**
   * Poster's tripcode
   */
  tripcode: string | null;

  /**
   * Subject
   */
  subject: string | null;

  /**
   * Email
   */
  email: string | null;

  /**
   * Comment text
   */
  comment: string;

  /**
   * Is post has sage (don't rise the thread up)
   */
  hasSage: boolean;

  /**
   * Attached file
   */
  attachedFile: AttachedFileDto | null;

  /**
   * List of replies (actual for opening posts)
   */
  children: CommentDto[];

  constructor(
    num: bigint,
    createdAt: Date,
    isAdmin: boolean,
    name: string,
    email: string | null,
    tripcode: string | null,
    subject: string | null,
    comment: string,
    hasSage: boolean,
    attachedFile: AttachedFileDto | null,
    children: CommentDto[]
  ) {
    this.num = num;
    this.createdAt = createdAt;
    this.isAdmin = isAdmin;
    this.name = name;
    this.email = email;
    this.tripcode = tripcode;
    this.subject = subject;
    this.comment = comment;
    this.hasSage = hasSage;
    this.attachedFile = attachedFile;
    this.children = children;
  }
}
