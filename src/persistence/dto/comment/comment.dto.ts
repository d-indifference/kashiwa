import { AttachedFileDto } from '@persistence/dto/comment/attached-file.dto';

export class CommentDto {
  num: bigint;

  createdAt: Date;

  isAdmin: boolean;

  name: string;

  tripcode: string | null;

  subject: string | null;

  comment: string;

  attachedFile: AttachedFileDto | null;

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
