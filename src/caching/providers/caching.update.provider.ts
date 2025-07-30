import { Injectable } from '@nestjs/common';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import * as pug from 'pug';
import * as path from 'node:path';
import { Constants } from '@library/constants';
import { applicationVersion, fileSize, formatDateTime, getRandomBanner, truncateText } from '@library/helpers';
import { LOCALE } from '@locale/locale';
import { BoardDto } from '@persistence/dto/board';
import { Page, PageRequest } from '@persistence/lib/page';
import { BoardPage, ThreadPage } from '@caching/pages';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { ThreadCollapsedDto } from '@persistence/dto/comment/collapsed';
import { CommentDto } from '@persistence/dto/comment/common';
import { CaptchaGeneratorProvider } from '@captcha/providers';

/**
 * Providers for page cache updating
 */
@Injectable()
export class CachingUpdateProvider {
  constructor(
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly fileSystem: FileSystemProvider,
    private readonly captchaGeneratorProvider: CaptchaGeneratorProvider,
    private readonly siteContext: SiteContextProvider
  ) {}

  /**
   * Rebuild cached pages for board
   * @param url Board URL
   */
  public async fullyReloadCache(url: string): Promise<void> {
    const threadNums = await this.commentPersistenceService.findThreadNums(url);
    await Promise.all([this.compileBoardPages(url), ...threadNums.map(num => this.reloadThreadPage(url, num))]);
  }

  /**
   * Find thread and compile its page
   */
  private async reloadThreadPage(url: string, num: bigint): Promise<void> {
    const board = await this.boardPersistenceService.findByUrl(url);
    const thread = await this.commentPersistenceService.findThread(url, num);
    await this.compileThreadPage(board, thread);
  }

  /**
   * Parallel reloading of board pages and thread page
   */
  public async reloadCacheForThread(url: string, num: bigint): Promise<void> {
    await Promise.all([await this.reloadThreadPage(url, num), await this.compileBoardPages(url)]);
  }

  /**
   * Parallel compiling of board thread preview pages
   */
  private async compileBoardPages(url: string): Promise<void> {
    const board = await this.boardPersistenceService.findByUrl(url);
    const firstPageRequest: PageRequest = { page: 0, limit: Constants.DEFAULT_PAGE_SIZE };
    const firstPage = await this.commentPersistenceService.findAll(board.id, firstPageRequest);

    if (firstPage.content.length === 0) {
      await this.compileBoardPage(board, firstPage);
    }

    const pageCount = firstPage.total;

    const pageRequests: PageRequest[] = Array.from({ length: pageCount }, (_, i) => ({
      page: i,
      limit: Constants.DEFAULT_PAGE_SIZE
    }));
    await Promise.all(pageRequests.map(pageRequest => this.findAndCompileBoardPage(board, pageRequest)));
  }

  /**
   * Find and compile found board page
   */
  private async findAndCompileBoardPage(board: BoardDto, pageRequest: PageRequest): Promise<void> {
    const page = await this.commentPersistenceService.findAll(board.id, pageRequest);
    await this.compileBoardPage(board, page);
  }

  /**
   * Compile board page from its pug template
   */
  private async compileBoardPage(board: BoardDto, page: Page<ThreadCollapsedDto>): Promise<void> {
    const pageContent: BoardPage = {
      board,
      captcha: board.boardSettings?.enableCaptcha
        ? await this.captchaGeneratorProvider.generate(board.boardSettings.isCaptchaCaseSensitive)
        : undefined,
      commons: { pageTitle: board.name },
      page
    };
    const compiledTemplate = this.compileTemplate('board.pug', pageContent);
    await this.fileSystem.writeTextFile(
      [board.url, `${page.current === 0 ? 'kashiwa' : page.current}${Constants.HTML_SUFFIX}`],
      compiledTemplate
    );
  }

  /**
   * Compile thread page from its pug template
   */
  private async compileThreadPage(board: BoardDto, thread: CommentDto): Promise<void> {
    const pageContent: ThreadPage = {
      board,
      captcha: board.boardSettings?.enableCaptcha
        ? await this.captchaGeneratorProvider.generate(board.boardSettings.isCaptchaCaseSensitive)
        : undefined,
      commons: { pageTitle: board.name },
      thread
    };

    const compiledTemplate = this.compileTemplate('thread.pug', pageContent);
    await this.fileSystem.writeTextFile(
      [board.url, Constants.RES_DIR, `${thread.num.toString()}${Constants.HTML_SUFFIX}`],
      compiledTemplate
    );
  }

  /**
   * Get HTML string from pug template
   */
  private compileTemplate(template: string, content: object): string {
    const compiledFunction = pug.compileFile(path.join(Constants.Paths.TEMPLATES, template));
    return compiledFunction({
      ...content,
      SITE_SETTINGS: () => this.siteContext.getGlobalSettings(),
      getRandomBanner,
      LOCALE,
      fileSize,
      applicationVersion,
      formatDateTime,
      truncateText
    });
  }
}
