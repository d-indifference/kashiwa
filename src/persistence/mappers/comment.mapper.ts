import { Injectable } from '@nestjs/common';
import { Comment, AttachedFile } from '@prisma/client';
import { CommentDto, AttachedFileDto } from '@persistence/dto/comment/common';
import { PrismaService } from '@persistence/lib';
import { ThreadCollapsedDto } from '@persistence/dto/comment/collapsed';
import { Page } from '@persistence/lib/page';
import { Constants } from '@library/constants';
import { reverse } from 'lodash';
import { AttachedFileModerationDto, CommentModerationDto } from '@persistence/dto/comment/moderation';
import { BoardShortDto } from '@persistence/dto/board';

/**
 * Mappings for `Comment` model
 */
@Injectable()
export class CommentMapper {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Async map page of comments as board page with thread preview
   * @param page Page of `Comment` (opening post) model
   */
  public async mapBoardPage(page: Page<Comment>): Promise<Page<ThreadCollapsedDto>> {
    const mappedPage = new Page<ThreadCollapsedDto>();
    mappedPage.content = [];
    mappedPage.current = page.current;
    mappedPage.total = page.total;
    mappedPage.previous = page.previous;
    mappedPage.next = page.next;

    const newContent: ThreadCollapsedDto[] = [];

    for (const c of page.content) {
      newContent.push(await this.openingPostToCollapsedThread(c));
    }

    mappedPage.content = newContent;

    return mappedPage;
  }

  /**
   * Map `Comment` to `CommentDto`
   * @param model `Comment` Prisma model
   * @param attachedFile `Comment`'s `AttachedFile` model
   * @param children `Comment`'s replies
   */
  public toDto(model: Comment, attachedFile: AttachedFile | null, children: Comment[]): CommentDto {
    const childrenDto: CommentDto[] = [];

    if (children.length > 0) {
      children.forEach(child => {
        childrenDto.push(this.toDto(child, child['attachedFile'], []));
      });
    }

    const attachedFileDto = this.attachedFileToDto(attachedFile);

    return new CommentDto(
      model.num,
      model.createdAt,
      model.isAdmin,
      model.name,
      model.email,
      model.tripcode,
      model.subject,
      model.comment,
      model.hasSage,
      attachedFileDto,
      childrenDto
    );
  }

  /**
   * Map `AttachedFile` to DTO
   * @param model `AttachedFile` model
   */
  public attachedFileToDto(model: AttachedFile | null): AttachedFileDto | null {
    if (!model) {
      return null;
    }

    return new AttachedFileDto(
      model.name,
      model.size,
      model.width,
      model.height,
      model.mime,
      model.isImage,
      model.thumbnail,
      model.thumbnailWidth,
      model.thumbnailHeight
    );
  }

  /**
   * Map `Comment` to moderation DTO
   * @param model `Comment` model
   * @param board Board short DTO
   */
  public toModerationDto(board: BoardShortDto, model: Comment): CommentModerationDto {
    const attachedFile = this.attachedFileToModerationDto(board, model['attachedFile']);

    const parentNum = model['parent'] ? (model['parent'].num as bigint) : model.num;

    return new CommentModerationDto(
      model.id,
      model.ip,
      model.num,
      parentNum,
      board.url,
      model.createdAt,
      model.name,
      model.email,
      model.subject,
      model.comment,
      attachedFile
    );
  }

  /**
   * Map `AttachedFile` to moderation DTO
   * @param model `AttachedFile` model
   * @param board Board short DTO
   */
  public attachedFileToModerationDto(
    board: BoardShortDto,
    model: AttachedFile | null
  ): AttachedFileModerationDto | null {
    if (!model) {
      return null;
    }

    return new AttachedFileModerationDto(
      model.id,
      board.url,
      model.name,
      model.thumbnail,
      model.thumbnailWidth,
      model.thumbnailHeight,
      model.isImage,
      model.mime
    );
  }

  /**
   * Map comment (opening post) as thread preview and enrich post by last replies
   */
  private async openingPostToCollapsedThread(comment: Comment): Promise<ThreadCollapsedDto> {
    const lastReplies = await this.prisma.comment.findMany({
      where: { parentId: comment.id },
      orderBy: [{ createdAt: 'desc' }],
      include: { attachedFile: true },
      take: Constants.DEFAULT_LAST_REPLIES_COUNT
    });

    const lastFiles = lastReplies.filter(r => r.attachedFile).length;

    const allRepliesCount = await this.prisma.comment.count({ where: { parentId: comment.id } });

    const allFilesCount = await this.prisma.comment.count({
      where: { parentId: comment.id, NOT: { attachedFileId: null } }
    });

    return {
      thread: this.toDto(comment, comment['attachedFile'], reverse(lastReplies)),
      omittedPosts: allRepliesCount - lastReplies.length,
      omittedFiles: allFilesCount - lastFiles
    };
  }
}
