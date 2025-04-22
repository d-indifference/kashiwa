import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { BoardPage } from '@posting/pages';
import { PageRequest } from '@persistence/lib/page';
import { CaptchaGeneratorProvider } from '@captcha/providers';

/**
 * Service for Board page of Posting module
 */
@Injectable()
export class BoardService {
  constructor(
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly captchaGeneratorProvider: CaptchaGeneratorProvider
  ) {}

  /**
   * Get board page
   * @param url Board URL
   * @param page Page request
   */
  public async getBoardPage(url: string, page: PageRequest): Promise<BoardPage> {
    const board = await this.boardPersistenceService.findByUrl(url);

    const threads = await this.commentPersistenceService.findAll(board.id, page);

    if (page.page > 0 && threads.content.length === 0) {
      throw new NotFoundException('Page was not found');
    }

    if (board.boardSettings?.enableCaptcha) {
      const captcha = await this.captchaGeneratorProvider.generate(board.boardSettings?.isCaptchaCaseSensitive);
      return new BoardPage(board, threads, captcha);
    }

    return new BoardPage(board, threads);
  }
}
