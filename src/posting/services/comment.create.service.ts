import { Injectable } from '@nestjs/common';
import { ReplyCreateForm, ThreadCreateForm } from '@posting/forms';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { WakabaMarkdownProvider } from '@posting/providers';
import { Prisma } from '@prisma/client';
import { enrichName, setPassword, setPostCookies } from '@posting/lib/functions';
import { Response } from 'express';
import { Constants } from '@library/constants';
import { BoardDto } from '@persistence/dto/board';
import { AttachedFileService } from '@posting/services/attached-file.service';
import { CachingProvider } from '@caching/providers';
import { InMemoryCacheProvider } from '@library/providers';

/**
 * Service for comment creation
 */
@Injectable()
export class CommentCreateService {
  constructor(
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly attachedFileService: AttachedFileService,
    private readonly wakabaMarkdown: WakabaMarkdownProvider,
    private readonly cachingProvider: CachingProvider,
    private readonly cache: InMemoryCacheProvider
  ) {}

  /**
   * Create a new thread
   * @param url Board URL
   * @param form Form for thread creation
   * @param ip Poster's IP
   * @param res `Express.js` response
   * @param isAdmin Check if poster is admin
   */
  public async createThread(
    url: string,
    form: ThreadCreateForm,
    ip: string,
    res: Response,
    isAdmin: boolean = false
  ): Promise<void> {
    const board = await this.boardPersistenceService.findByUrl(url);
    const input = await this.toThreadCreateInput(board, form, ip, isAdmin);
    const newThread = await this.commentPersistenceService.createComment(url, input);

    await this.deleteOldestPostOnMaxThreadsOnBoard(board);
    await this.cachingProvider.reloadCacheForThread(url, newThread.num);

    this.cache.delKeyStartWith(`api.findThreadsPage:${url}`);

    setPostCookies(form, input.password, res);

    res.redirect(`/${url}/res/${newThread.num}${Constants.HTML_SUFFIX}#${newThread.num}`);
  }

  /**
   * Create a new reply
   * @param url Board URL
   * @param parentNum Parent thread for a new comment
   * @param form Form for thread creation
   * @param ip Poster's IP
   * @param res `Express.js` response
   * @param isAdmin Check if poster is admin
   */
  public async createReply(
    url: string,
    parentNum: bigint,
    form: ReplyCreateForm,
    ip: string,
    res: Response,
    isAdmin: boolean = false
  ): Promise<void> {
    const board = await this.boardPersistenceService.findByUrl(url);
    const input = await this.toReplyCreateInput(board, parentNum, form, ip, isAdmin);
    const newReply = await this.commentPersistenceService.createComment(url, input);

    await this.updateLastHit(board, form, parentNum);
    await this.cachingProvider.reloadCacheForThread(url, parentNum);
    this.cache.del(`api.findThread:${url}:${parentNum}`);
    this.cache.delKeyStartWith(`api.findThreadsPage:${url}`);

    setPostCookies(form, input.password, res);
    res.redirect(`/${url}/res/${parentNum}${Constants.HTML_SUFFIX}#${newReply.num}`);
  }

  /**
   * Make the `Prisma.CommentCreateInput` for the new thread
   */
  private async toThreadCreateInput(
    board: BoardDto,
    form: ThreadCreateForm,
    ip: string,
    isAdmin: boolean
  ): Promise<Prisma.CommentCreateInput> {
    const input = await this.toCommentCreateInput(board, isAdmin, ip, form, false);
    input.lastHit = new Date();
    return input;
  }

  /**
   * Make the `Prisma.CommentCreateInput` for the new reply
   */
  private async toReplyCreateInput(
    board: BoardDto,
    parentNum: bigint,
    form: ReplyCreateForm,
    ip: string,
    isAdmin: boolean
  ): Promise<Prisma.CommentCreateInput> {
    const input = await this.toCommentCreateInput(board, isAdmin, ip, form, form.sage);
    const parent = await this.commentPersistenceService.findOpeningPost(board.url, parentNum);
    input.parent = { connect: { id: parent.id } };
    return input;
  }

  /**
   * Make the `Prisma.CommentCreateInput` with the same fields for thread & reply
   */
  private async toCommentCreateInput(
    board: BoardDto,
    isAdmin: boolean,
    ip: string,
    form: ThreadCreateForm | ReplyCreateForm,
    hasSage: boolean
  ): Promise<Prisma.CommentCreateInput> {
    const { attachedFile } = await this.attachedFileService.createAttachedFile(form.file, board.url);
    const comment = await this.wakabaMarkdown.formatAsWakaba(
      form.comment,
      board.url,
      board.boardSettings ? board.boardSettings.allowMarkdown : false,
      isAdmin
    );
    const { name, tripcode } = enrichName(form.name, board, isAdmin);
    const password = setPassword(form.password);
    const createdAt = new Date();
    return {
      createdAt,
      board: { connect: { id: board.id } },
      num: -1,
      isAdmin,
      ip,
      name,
      tripcode,
      email: form.email,
      subject: form.subject,
      comment,
      password,
      attachedFile,
      hasSage
    };
  }

  /**
   * Delete a thread with the oldest `lastHit` value if the board capacity is exceeded
   */
  private async deleteOldestPostOnMaxThreadsOnBoard(board: BoardDto): Promise<void> {
    const threadCount = await this.commentPersistenceService.threadCount(board.url);

    if (board.boardSettings) {
      if (threadCount > board.boardSettings.maxThreadsOnBoard) {
        const oldestThreadNum = await this.commentPersistenceService.removeThreadWithOldestLastHit(board.url);

        if (oldestThreadNum) {
          await this.cachingProvider.removeThreadPage(board.url, oldestThreadNum);
        }
      }
    }
  }

  /**
   * Update the thread's last hit if the reply does not contain a sage
   */
  private async updateLastHit(board: BoardDto, form: ReplyCreateForm, parentNum: bigint): Promise<void> {
    const childrenLength = await this.commentPersistenceService.findRepliesCount(board.url, parentNum);
    if (board.boardSettings) {
      if (this.getSageFromForm(form) && childrenLength <= board.boardSettings?.bumpLimit) {
        await this.commentPersistenceService.updateThreadLastHit(board.url, parentNum);
      }
    }
  }

  /**
   * Get sage options from the form
   */
  private getSageFromForm(form: ReplyCreateForm): boolean {
    if (form.email) {
      return form.email.trim().toLowerCase() !== 'sage';
    }

    return !form.sage;
  }
}
