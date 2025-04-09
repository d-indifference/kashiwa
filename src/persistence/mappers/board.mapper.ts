import { Injectable } from '@nestjs/common';
import { BoardCreateDto, BoardDto, BoardSettingsDto, BoardShortDto } from '@persistence/dto/board';
import { Board, BoardSettings, Prisma } from '@prisma/client';
import { BoardUpdateDto } from '@persistence/dto/board/board.update.dto';

@Injectable()
export class BoardMapper {
  public create(dto: BoardCreateDto): Prisma.BoardCreateInput {
    return {
      boardSettings: {
        create: {
          allowPosting: dto.allowPosting,
          strictAnonymity: dto.strictAnonymity,
          threadFileAttachmentMode: dto.threadFileAttachmentMode,
          replyFileAttachmentMode: dto.replyFileAttachmentMode,
          delayAfterThread: dto.delayAfterThread,
          delayAfterReply: dto.delayAfterReply,
          minFileSize: dto.minFileSize,
          maxFileSize: dto.maxFileSize,
          allowMarkdown: dto.allowMarkdown,
          allowTripcodes: dto.allowTripcodes,
          maxThreadsOnBoard: dto.maxThreadsOnBoard,
          bumpLimit: dto.bumpLimit,
          maxStringFieldSize: dto.maxStringFieldSize,
          maxCommentSize: dto.maxCommentSize,
          defaultPosterName: dto.defaultPosterName,
          defaultModeratorName: dto.defaultModeratorName,
          enableCaptcha: dto.enableCaptcha,
          isCaptchaCaseSensitive: dto.isCaptchaCaseSensitive,
          allowedFileTypes: JSON.stringify(dto.allowedFileTypes),
          rules: dto.rules
        }
      },
      url: dto.url,
      name: dto.name
    };
  }

  public update(dto: BoardUpdateDto): Prisma.BoardUpdateInput {
    const boardSettings: Prisma.BoardSettingsUpdateOneWithoutBoardNestedInput = {
      update: {
        where: { id: dto.id },
        data: {
          allowPosting: dto.allowPosting ?? undefined,
          strictAnonymity: dto.strictAnonymity ?? undefined,
          threadFileAttachmentMode: dto.threadFileAttachmentMode ?? undefined,
          replyFileAttachmentMode: dto.replyFileAttachmentMode ?? undefined,
          delayAfterThread: dto.delayAfterThread ?? undefined,
          delayAfterReply: dto.delayAfterReply ?? undefined,
          minFileSize: dto.minFileSize ?? undefined,
          maxFileSize: dto.maxFileSize ?? undefined,
          allowMarkdown: dto.allowMarkdown ?? undefined,
          allowTripcodes: dto.allowTripcodes ?? undefined,
          maxThreadsOnBoard: dto.maxThreadsOnBoard ?? undefined,
          bumpLimit: dto.bumpLimit ?? undefined,
          maxStringFieldSize: dto.maxStringFieldSize ?? undefined,
          maxCommentSize: dto.maxCommentSize ?? undefined,
          defaultPosterName: dto.defaultPosterName ?? undefined,
          defaultModeratorName: dto.defaultModeratorName ?? undefined,
          enableCaptcha: dto.enableCaptcha ?? undefined,
          isCaptchaCaseSensitive: dto.isCaptchaCaseSensitive ?? undefined,
          allowedFileTypes: dto.allowedFileTypes ? JSON.stringify(dto.allowedFileTypes) : undefined,
          rules: dto.rules ?? undefined
        }
      }
    };

    return {
      url: dto.url ?? undefined,
      name: dto.name ?? undefined,
      boardSettings
    };
  }

  public toDto(board: Board, boardSettings: BoardSettings | null): BoardDto {
    if (boardSettings) {
      const boardSettingsDto = new BoardSettingsDto(
        boardSettings.allowPosting,
        boardSettings.strictAnonymity,
        boardSettings.threadFileAttachmentMode,
        boardSettings.replyFileAttachmentMode,
        boardSettings.delayAfterThread,
        boardSettings.delayAfterReply,
        boardSettings.minFileSize,
        boardSettings.maxFileSize,
        boardSettings.allowMarkdown,
        boardSettings.allowTripcodes,
        boardSettings.maxThreadsOnBoard,
        boardSettings.bumpLimit,
        boardSettings.maxStringFieldSize,
        boardSettings.maxCommentSize,
        boardSettings.defaultPosterName,
        boardSettings.defaultModeratorName,
        boardSettings.enableCaptcha,
        boardSettings.isCaptchaCaseSensitive,
        boardSettings.allowedFileTypes as string[],
        boardSettings.rules
      );

      return new BoardDto(board.id, board.url, board.name, boardSettingsDto);
    }

    return new BoardDto(board.id, board.url, board.name);
  }

  public toShortDto(board: Board): BoardShortDto {
    return new BoardShortDto(board.id, board.url, board.name, board.postCount);
  }
}
