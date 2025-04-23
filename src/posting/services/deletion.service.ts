import { Injectable } from '@nestjs/common';
import { PostsDeleteForm } from '@posting/forms';
import { Response } from 'express';
import {
  AttachedFilePersistenceService,
  BoardPersistenceService,
  CommentPersistenceService
} from '@persistence/services';
import { ThreadPageCompilerService } from '@library/page-compiler';
import { ThreadMapper } from '@library/mappers';
import { Constants } from '@library/constants';
import { CaptchaGeneratorProvider } from '@captcha/providers';
import { PageCachingProvider } from '@posting/providers';

/**
 * Service for posts deletion
 */
@Injectable()
export class DeletionService {
  constructor(
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly pageCompilerService: ThreadPageCompilerService,
    private readonly threadMapper: ThreadMapper,
    private readonly attachedFilePersistenceService: AttachedFilePersistenceService,
    private readonly captchaGeneratorProvider: CaptchaGeneratorProvider,
    private readonly pageCachingProvider: PageCachingProvider
  ) {}

  /**
   * Deletion of posts from board / thread page
   * @param url Board URL
   * @param form Deletion form
   * @param res `Express.js` response
   * @param num Thread number
   */
  public async processPostDeletion(url: string, form: PostsDeleteForm, res: Response, num?: string): Promise<void> {
    await this.processBasePostDeletion(url, form);

    if (num) {
      res.redirect(this.makeRedirectionString(url, form, num));
    } else {
      res.redirect(`/${url}/kashiwa${Constants.HTML_SUFFIX}`);
    }
  }

  /**
   * Making of redirection string after deletion of replies in thread
   */
  private makeRedirectionString(url: string, form: PostsDeleteForm, num: string): string {
    if (form.delete.includes(num) && !form.fileOnly) {
      return `/${url}`;
    }

    return `/${url}/${Constants.RES_DIR}/${num}${Constants.HTML_SUFFIX}#${num}`;
  }

  /**
   * Base posts deletion
   */
  private async processBasePostDeletion(url: string, form: PostsDeleteForm): Promise<void> {
    const candidateIds = await this.commentPersistenceService.findCommentUserDeletionCandidates(
      url,
      form.delete.map(num_ => BigInt(num_)),
      form.password
    );

    if (!form.fileOnly) {
      for (const candidateId of candidateIds) {
        await this.commentPersistenceService.removeCommentById(candidateId);
      }
    } else {
      for (const candidateId of candidateIds) {
        await this.attachedFilePersistenceService.clearFileByCommentId(candidateId);
      }
    }

    await this.updateBoardCache(url);
  }

  /**
   * Updating of board cache
   */
  private async updateBoardCache(url: string): Promise<void> {
    const board = await this.boardPersistenceService.findByUrl(url);

    const threadNums = await this.commentPersistenceService.findAllThreadNums(board.url);

    for (const num of threadNums) {
      const parentThread = await this.commentPersistenceService.findThread(board.url, num);
      const page = this.threadMapper.mapPage(board, parentThread);

      if (board.boardSettings) {
        if (board.boardSettings.enableCaptcha) {
          page.captcha = await this.captchaGeneratorProvider.generate(board.boardSettings.isCaptchaCaseSensitive);
        }
      }

      await this.pageCompilerService.saveThreadPage(page);
      await this.pageCachingProvider.cacheBoardPages(url);
    }
  }
}
