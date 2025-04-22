import { Injectable } from '@nestjs/common';
import { AttachedFileDto, CommentDto } from '@persistence/dto/comment/common';
import { IAttachedFile, IBoard, IPage, IPost } from '@library/page-compiler';
import { BoardDto } from '@persistence/dto/board';
import { ICaptcha } from '@captcha/interfaces';

@Injectable()
export class ThreadMapper {
  public mapPage(board: BoardDto, openingPost: CommentDto, captcha?: ICaptcha): IPage {
    return {
      board: this.mapBoard(board),
      openingPost: this.mapPost(openingPost),
      replies: openingPost.children.map(comment => this.mapPost(comment)),
      captcha
    };
  }

  private mapAttachedFile(attachedFile: AttachedFileDto | null): IAttachedFile | undefined {
    if (!attachedFile) {
      return undefined;
    }

    return {
      name: attachedFile.name,
      size: attachedFile.size,
      width: attachedFile.width,
      height: attachedFile.height,
      isImage: attachedFile.isImage,
      mime: attachedFile.mime,
      thumbnail: attachedFile.thumbnail,
      thumbnailWidth: attachedFile.thumbnailWidth,
      thumbnailHeight: attachedFile.thumbnailHeight
    };
  }

  private mapPost(comment: CommentDto): IPost {
    return {
      attachedFile: this.mapAttachedFile(comment.attachedFile),
      num: comment.num,
      subject: comment.subject,
      name: comment.name,
      email: comment.email,
      tripcode: comment.tripcode,
      date: comment.createdAt,
      comment: comment.comment,
      hasSage: comment.hasSage,
      isAdmin: comment.isAdmin
    };
  }

  private mapBoard(board: BoardDto): IBoard {
    return {
      url: board.url,
      name: board.name,
      boardSettings: board.boardSettings
    };
  }
}
