import { Injectable } from '@nestjs/common';
import {
  AttachedFilePersistenceService,
  CommentPersistenceService,
  ReportPersistenceService
} from '@persistence/services';
import { CachingProvider } from '@caching/providers';
import { CommentDeleteForm } from '@posting/forms';
import { Response } from 'express';
import { Constants } from '@library/constants';
import { InMemoryCacheProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { LOCALE } from '@locale/locale';
import { ReportType } from '@prisma/client';
import { ReportCreateDto } from '@persistence/dto/report';

/**
 * Service for comment deletion
 */
@Injectable()
export class CommentDeleteService {
  constructor(
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly attachedFilePersistenceService: AttachedFilePersistenceService,
    private readonly reportPersistenceService: ReportPersistenceService,
    private readonly cachingProvider: CachingProvider,
    private readonly cache: InMemoryCacheProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(CommentDeleteService.name);
  }

  /**
   * Delete comments or clear a files or report to the administration about comments
   * @param url Board URL
   * @param form Form for user's comment deletion
   * @param res `Express.js` response
   * @param num Thread num
   */
  public async deleteComment(url: string, form: CommentDeleteForm, res: Response, num?: bigint): Promise<void> {
    this.logger.info({ url, form, num: num?.toString() }, 'deleteComment');

    if (form.submitType === LOCALE.DELETE) {
      await this.processCommentDeletion(url, form);
    } else if (form.submitType === LOCALE.REPORT) {
      await this.processCommentReporting(url, form);
    }

    await this.cachingProvider.fullyReloadCache(url);

    this.cache.delKeyStartWith(`api.findThread:${url}`);
    this.cache.delKeyStartWith(`api.findPost:${url}`);
    this.cache.delKeyStartWith(`api.findThreadsPage:${url}`);

    if (num) {
      res.redirect(this.makeRedirectionString(url, form, num));
    } else {
      res.redirect(`/${url}/kashiwa${Constants.HTML_SUFFIX}`);
    }
  }

  /**
   * Get the deletion way from form and process post deletion
   */
  private async processCommentDeletion(url: string, form: CommentDeleteForm): Promise<void> {
    if (form.fileOnly) {
      await this.attachedFilePersistenceService.clearByPassword(url, form.delete, form.password);
    } else {
      await this.commentPersistenceService.removeByPassword(url, form.delete, form.password);
    }
  }

  /**
   * Make the redirection string. If the thread will be deleted, user will be redirected to the board start page,
   * else user will stay in the thread
   */
  private makeRedirectionString(url: string, form: CommentDeleteForm, num: bigint): string {
    if (form.delete.includes(num) && !form.fileOnly) {
      return `/${url}/kashiwa${Constants.HTML_SUFFIX}}`;
    }

    return `/${url}/${Constants.RES_DIR}/${num}${Constants.HTML_SUFFIX}#${num}`;
  }

  /**
   * Make a report about the comments or files
   */
  private async processCommentReporting(url: string, form: CommentDeleteForm): Promise<void> {
    let reportType: ReportType;

    if (form.fileOnly) {
      reportType = ReportType.FILE;
    } else {
      reportType = ReportType.COMMENT;
    }

    const dto = new ReportCreateDto(url, form.delete, reportType);

    await this.reportPersistenceService.create(dto);
  }
}
