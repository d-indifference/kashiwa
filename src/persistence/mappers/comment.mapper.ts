import { Injectable } from '@nestjs/common';
import { AttachedFile, Board, Comment } from '@prisma/client';
import { AttachedFileDto, CommentDto } from '@persistence/dto/comment/common';
import { ThreadCollapsedDto } from '@persistence/dto/comment/collapsed';
import { Constants } from '@library/constants';
import { AttachedFileModerationDto, CommentModerationDto } from '@persistence/dto/comment/moderation';

/**
 * Mappings for `Comment` model
 */
@Injectable()
export class CommentMapper {
  public toDto(comment: Comment, replies: Comment[] = []): CommentDto {
    return {
      id: comment.id,
      num: comment.num,
      createdAt: comment.createdAt,
      isAdmin: comment.isAdmin,
      name: comment.name,
      tripcode: comment.tripcode,
      subject: comment.subject,
      email: comment.email,
      comment: comment.comment,
      hasSage: comment.hasSage,
      attachedFile: this.mapAttachedFile(comment['attachedFile'] as AttachedFile),
      children: replies.map(reply => this.toDto(reply))
    };
  }

  /**
   * Map model to collapsed DTO
   * @param comment Prisma `Comment` model
   */
  public toCollapsedDto(comment: Comment): ThreadCollapsedDto {
    const omitted = this.mapOmittedPosts(comment);

    let children = comment['children'] as Comment[];

    if (children.length > Constants.DEFAULT_LAST_REPLIES_COUNT) {
      children = children.slice(-Constants.DEFAULT_LAST_REPLIES_COUNT);
    }

    return {
      thread: this.toDto(comment, children),
      ...omitted
    };
  }

  /**
   * Map model to moderation DTO
   * @param comment Prisma `Comment` model
   */
  public toModerationDto(comment: Comment): CommentModerationDto {
    const parent = comment['parent'] as Comment | null;
    const attachedFile = comment['attachedFile'] as AttachedFile | null;
    const board = comment['board'] as Board;

    return {
      ...comment,
      parentNum: parent ? parent.num : comment.num,
      attachedFile: this.mapAttachedFileModeration(attachedFile),
      boardUrl: board.url
    };
  }

  private mapOmittedPosts(comment: Comment): Pick<ThreadCollapsedDto, 'omittedPosts' | 'omittedFiles'> {
    const children = comment['children'] as Comment[];

    if (children.length > Constants.DEFAULT_LAST_REPLIES_COUNT) {
      const omittedPosts = children.slice(0, children.length - Constants.DEFAULT_LAST_REPLIES_COUNT);
      const omittedFilesCount = omittedPosts.filter(p => p.attachedFileId).length;

      return { omittedFiles: omittedFilesCount, omittedPosts: omittedPosts.length };
    }

    return { omittedPosts: 0, omittedFiles: 0 };
  }

  private mapAttachedFile(model: AttachedFile | null): AttachedFileDto | null {
    if (!model) {
      return null;
    }

    return { ...model };
  }

  private mapAttachedFileModeration(model: AttachedFile | null): AttachedFileModerationDto | null {
    if (!model) {
      return null;
    }

    const board = model['board'] as Board;

    return {
      ...model,
      boardUrl: board.url
    };
  }
}
