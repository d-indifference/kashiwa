import { Injectable } from '@nestjs/common';
import { AttachedFileMapper } from '@api/mappers/attached-file.mapper';
import { CommentDto as PersistenceCommentDto } from '@persistence/dto/comment/common';
import { CommentDto, CommentPageDto } from '@api/dto/v1';
import { Page } from '@persistence/lib/page';
import { plainToInstance } from 'class-transformer';
import { ThreadCollapsedDto } from '@persistence/dto/comment/collapsed';

/**
 * Mapper for `Comment` object
 */
@Injectable()
export class CommentMapper {
  constructor(private readonly attachedFileMapper: AttachedFileMapper) {}

  /**
   * Mapping from persistence object to REST API DTO
   * @param comment `Comments` persistence object
   * @param boardUrl URL of board
   */
  public toCommentApiDto(comment: PersistenceCommentDto, boardUrl: string): CommentDto {
    const mappedChildren = comment.children.map(c => this.toCommentApiDto(c, boardUrl));
    const plain: CommentDto = {
      createdAt: comment.createdAt,
      isAdmin: comment.isAdmin,
      name: comment.name,
      tripcode: comment.tripcode,
      subject: comment.subject,
      email: comment.email,
      comment: comment.comment,
      hasSage: comment.hasSage,
      num: comment.num.toString(),
      attachedFile: this.attachedFileMapper.toApiDto(comment.attachedFile, boardUrl),
      children: comment.children.length > 0 ? mappedChildren : undefined
    };

    return plainToInstance(CommentDto, plain);
  }

  /**
   * Mapping from persistence page to REST API DTO
   * @param page `Comments` persistence page
   * @param boardUrl URL of board
   */
  public toApiPage(page: Page<ThreadCollapsedDto>, boardUrl: string): CommentPageDto {
    const plain: CommentPageDto = {
      ...page,
      content: page.content.map(c => {
        c.thread.children = [];
        return this.toCommentApiDto(c.thread, boardUrl);
      })
    };

    return plainToInstance(CommentPageDto, plain);
  }
}
