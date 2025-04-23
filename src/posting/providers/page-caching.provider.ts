import { Injectable } from '@nestjs/common';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { CaptchaGeneratorProvider } from '@captcha/providers';
import { BoardPageCompilerService } from '@library/page-compiler';
import { BoardDto } from '@persistence/dto/board';
import { BoardPage } from '@posting/pages';
import { PageRequest } from '@persistence/lib/page';
import { FilesystemOperator } from '@library/filesystem';

/**
 * Provider which finds board pages and caches them to file
 */
@Injectable()
export class PageCachingProvider {
  constructor(
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly captchaGeneratorProvider: CaptchaGeneratorProvider,
    private readonly boardPageCompilerService: BoardPageCompilerService
  ) {}

  /**
   * Find all board pages and writes them to HTML files
   * @param identifier Board URL ord UUID
   * @param isId if it is `true`, board will be found by ID, else, by URL
   */
  public async cacheBoardPages(identifier: string, isId: boolean = false): Promise<void> {
    let board: BoardDto;

    if (isId) {
      board = await this.boardPersistenceService.findDtoById(identifier);
    } else {
      board = await this.boardPersistenceService.findByUrl(identifier);
    }

    await FilesystemOperator.removeAllFilesByExt([board.url], 'html');

    const pages = await this.getAllBoardPages(board);

    await this.boardPageCompilerService.saveBoardPages(pages);
  }

  /**
   * Get the list of board pages by their board DTO
   */
  private async getAllBoardPages(board: BoardDto): Promise<BoardPage[]> {
    const pages: BoardPage[] = [];

    const pagRequest = new PageRequest(0);

    const zeroPage = await this.getBoardPage(board, pagRequest);
    pages.push(zeroPage);

    if (zeroPage.threads.total > 1) {
      for (let i = 1; i <= zeroPage?.threads.total - 1; i++) {
        const page = await this.getBoardPage(board, new PageRequest(i));
        pages.push(page);
      }
    }

    return pages;
  }

  /**
   * Get the board page by DTO and page request
   */
  private async getBoardPage(board: BoardDto, pageRequest: PageRequest): Promise<BoardPage> {
    const threads = await this.commentPersistenceService.findAll(board.id, pageRequest);

    if (board.boardSettings?.enableCaptcha) {
      const captcha = await this.captchaGeneratorProvider.generate(board.boardSettings?.isCaptchaCaseSensitive);
      return new BoardPage(board, threads, captcha);
    }

    return new BoardPage(board, threads);
  }
}
