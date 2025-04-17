import { Injectable } from '@nestjs/common';
import { BoardShortDto } from '@persistence/dto/board';
import {
  AttachedFilePersistenceService,
  BoardPersistenceService,
  CommentPersistenceService
} from '@persistence/services';
import { ListPage } from '@admin/pages';
import { PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { CommentModerationDto } from '@persistence/dto/comment/moderation';
import { ModerationDeletePostForm } from '@admin/forms/moderation';
import { Response } from 'express';
import { BoardService } from '@admin/services/board.service';

/**
 * Service for moderation
 */
@Injectable()
export class ModerationService {
  constructor(
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly attachedFilePersistenceService: AttachedFilePersistenceService,
    private readonly boardService: BoardService
  ) {}

  /**
   * Get list of boards
   * @param page Page request
   * @param session Session object
   */
  public async getBoardsList(page: PageRequest, session: ISession): Promise<ListPage<BoardShortDto>> {
    const boards = await this.boardPersistenceService.findAll(page);

    return new ListPage(session, boards);
  }

  /**
   * Get list of comments on board for moderation
   * @param boardId Board ID
   * @param page Page request
   * @param session Session payload
   */
  public async getCommentsList(
    boardId: string,
    page: PageRequest,
    session: ISession
  ): Promise<ListPage<CommentModerationDto>> {
    const comments = await this.commentPersistenceService.findForModeration(boardId, page);

    return new ListPage(session, comments);
  }

  /**
   * Delete post by selected option
   * @param commentId Comment ID
   * @param form Form with deletion options
   * @param res `Express.js` response
   */
  public async deletePost(commentId: string, form: ModerationDeletePostForm, res: Response): Promise<void> {
    if (form.post) {
      await this.commentPersistenceService.removeCommentById(commentId);
    }

    if (form.file) {
      await this.attachedFilePersistenceService.clearFileByCommentId(commentId);
    }

    if (form.allByIp) {
      await this.commentPersistenceService.removeAllCommentsByIp(form.boardId, form.ip);
    }

    await this.boardService.updateBoardCache(form.boardId);

    res.redirect(form.redirect);
  }
}
