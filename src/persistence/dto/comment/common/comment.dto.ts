import { AttachedFileDto } from '@persistence/dto/comment/common/attached-file.dto';

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
   * Comment text
   */
  comment: string;

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
    tripcode: string | null,
    subject: string | null,
    comment: string,
    attachedFile: AttachedFileDto | null,
    children: CommentDto[]
  ) {
    this.num = num;
    this.createdAt = createdAt;
    this.isAdmin = isAdmin;
    this.name = name;
    this.tripcode = tripcode;
    this.subject = subject;
    this.comment = comment;
    this.attachedFile = attachedFile;
    this.children = children;
  }
}
