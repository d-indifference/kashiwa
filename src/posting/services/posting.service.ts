import { Injectable } from '@nestjs/common';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { ReplyCreateForm, ThreadCreateForm } from '@posting/forms';
import { Response } from 'express';
import { processTripcode, setPassword, WakabaMarkdownService } from '@posting/lib';
import { BoardDto } from '@persistence/dto/board';
import { Comment, Prisma } from '@prisma/client';
import { PageCompilerService } from '@library/page-compiler';
import { Constants } from '@library/constants';
import { AttachedFileService } from '@posting/services/attached-file.service';
import { ThreadMapper } from '@library//mappers';

/**
 * Service of comment posting
 */
@Injectable()
export class PostingService {
  constructor(
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly wakabaMarkdownService: WakabaMarkdownService,
    private readonly pageCompilerService: PageCompilerService,
    private readonly attachedFileService: AttachedFileService,
    private readonly threadMapper: ThreadMapper
  ) {}

  /**
   * Create a new thread
   * @param url Board URL
   * @param form Thread creation form
   * @param ip User's IP
   * @param res `Express.js response`
   * @param isAdmin If it is administrator's post
   */
  public async createThread(
    url: string,
    form: ThreadCreateForm,
    ip: string,
    res: Response,
    isAdmin: boolean = false
  ): Promise<void> {
    form.password = setPassword(form.password);

    const { board, name, tripcode, comment } = await this.makeBaseCommentPreparing(
      url,
      form.name,
      form.comment,
      isAdmin
    );

    const createInput: Prisma.CommentCreateInput = this.makeThreadCreateInput(
      board.id,
      isAdmin,
      ip,
      name,
      tripcode,
      comment,
      form
    );

    createInput.attachedFile =
      (await this.attachedFileService.createAttachedFileCreationInput(form.file, board.url)).attachedFile ?? undefined;

    const newThread = await this.commentPersistenceService.createComment(url, createInput);

    const pagePayload = this.threadMapper.mapPage(board, newThread);

    await this.pageCompilerService.saveThreadPage(pagePayload);

    res.cookie('kashiwa_pass', form.password, { maxAge: 315360000000 });

    res.redirect(`/${url}/res/${newThread.num}${Constants.HTML_SUFFIX}#${newThread.num}`);
  }

  /**
   * Create a new thread reply
   * @param url Board URL
   * @param num Parent thread number
   * @param form Thread creation form
   * @param ip User's IP
   * @param res `Express.js response`
   * @param isAdmin If it is administrator's post
   */
  public async createReply(
    url: string,
    num: bigint,
    form: ReplyCreateForm,
    ip: string,
    res: Response,
    isAdmin: boolean = false
  ): Promise<void> {
    form.password = setPassword(form.password);

    const { board, name, tripcode, comment } = await this.makeBaseCommentPreparing(
      url,
      form.name,
      form.comment,
      isAdmin
    );

    const createInput: Prisma.CommentCreateInput = this.makeReplyCreateInput(
      board.id,
      num,
      isAdmin,
      ip,
      name,
      tripcode,
      comment,
      form
    );

    createInput.attachedFile =
      (await this.attachedFileService.createAttachedFileCreationInput(form.file, board.url)).attachedFile ?? undefined;

    const newReply = await this.commentPersistenceService.createComment(url, createInput);

    const parentThread = await this.commentPersistenceService.findThread(url, num);

    const pagePayload = this.threadMapper.mapPage(board, parentThread);

    await this.pageCompilerService.saveThreadPage(pagePayload);

    if (board.boardSettings) {
      if (!form.sage && newReply.children.length <= board.boardSettings?.bumpLimit) {
        await this.commentPersistenceService.updateThreadLastHit(url, num);
      }
    }

    res.cookie('kashiwa_pass', form.password, { maxAge: 315360000000 });

    res.redirect(`/${url}/res/${num}${Constants.HTML_SUFFIX}#${newReply.num}`);
  }

  private async makeBaseCommentPreparing(
    url: string,
    formName: string | undefined,
    comment: string,
    isAdmin: boolean
  ): Promise<Pick<Comment, 'name' | 'tripcode' | 'comment'> & { board: BoardDto }> {
    const board = await this.boardPersistenceService.findByUrl(url);

    const processedComment = await this.processComment(
      comment,
      url,
      isAdmin,
      board.boardSettings?.allowMarkdown ?? false
    );

    const { name, tripcode } = this.processNameAndTripcode(formName, board, isAdmin);

    return { name, tripcode, comment: processedComment, board };
  }

  private async processComment(
    comment: string,
    url: string,
    isAdmin: boolean,
    isMarkdownEnabled: boolean
  ): Promise<string> {
    if (isAdmin) {
      return comment;
    }

    return await this.wakabaMarkdownService.formatAsWakaba(comment, url, isMarkdownEnabled);
  }

  private processNameAndTripcode(
    name: string | undefined,
    board: BoardDto,
    isAdmin: boolean
  ): Pick<Comment, 'name' | 'tripcode'> {
    if (!name) {
      return { name: this.processName(name, board, isAdmin), tripcode: null };
    }

    const splitName = name.split('#');

    if (splitName.length > 1) {
      const password = splitName.slice(1).join('#');

      return { name: this.processName(splitName[0], board, isAdmin), tripcode: processTripcode(password) };
    }

    return { name: this.processName(splitName[0], board, isAdmin), tripcode: null };
  }

  private processName(name: string | undefined, board: BoardDto, isAdmin: boolean): string {
    if (name) {
      return name;
    }

    if (isAdmin) {
      if (!board.boardSettings) {
        return 'Moderator';
      }

      return board.boardSettings?.defaultModeratorName;
    }

    if (!board.boardSettings) {
      return 'Anonymous';
    }

    return board.boardSettings?.defaultPosterName;
  }

  private makeBaseCommentCreateInput(
    boardId: string,
    isAdmin: boolean,
    ip: string,
    name: string,
    tripcode: string | null,
    email: string | undefined,
    subject: string | undefined,
    comment: string,
    password: string
  ): Prisma.CommentCreateInput {
    return {
      board: { connect: { id: boardId } },
      num: -1,
      createdAt: new Date(),
      isAdmin,
      ip,
      name,
      tripcode,
      email,
      subject,
      comment,
      password,
      lastHit: null,
      hasSage: false
    };
  }

  private makeThreadCreateInput(
    boardId: string,
    isAdmin: boolean,
    ip: string,
    name: string,
    tripcode: string | null,
    processedComment: string,
    form: ThreadCreateForm
  ): Prisma.CommentCreateInput {
    const input = this.makeBaseCommentCreateInput(
      boardId,
      isAdmin,
      ip,
      name,
      tripcode,
      form.email,
      form.subject,
      processedComment,
      form.password
    );
    input.lastHit = new Date();

    return input;
  }

  private makeReplyCreateInput(
    boardId: string,
    parentNum: bigint,
    isAdmin: boolean,
    ip: string,
    name: string,
    tripcode: string | null,
    processedComment: string,
    form: ReplyCreateForm
  ): Prisma.CommentCreateInput {
    const input = this.makeBaseCommentCreateInput(
      boardId,
      isAdmin,
      ip,
      name,
      tripcode,
      form.email,
      form.subject,
      processedComment,
      form.password
    );
    input.parent = { connect: { boardId_num: { boardId, num: parentNum } } };
    input.hasSage = form.sage;

    return input;
  }
}
