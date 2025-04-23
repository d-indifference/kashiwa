import { Injectable } from '@nestjs/common';
import { BoardPage } from '@posting/pages';
import * as pug from 'pug';
import * as path from 'node:path';
import { Constants } from '@library/constants';
import { FilesystemOperator } from '@library/filesystem';
import { getRandomBanner } from '@library/page-compiler/helpers';

/**
 * Page compiler for boards pages
 */
@Injectable()
export class BoardPageCompilerService {
  private readonly template = 'board.pug';

  /**
   * Compile board pages
   * @param boardPages List of board pages to saving on disk
   */
  public async saveBoardPages(boardPages: BoardPage[]): Promise<void> {
    if (boardPages.length > 0) {
      await this.saveBoardPage(boardPages[0], 'kashiwa');

      if (boardPages.length > 1) {
        for (const [idx, boardPage] of boardPages.slice(1, boardPages.length).entries()) {
          await this.saveBoardPage(boardPage, `${idx + 1}`);
        }
      }
    }
  }

  /**
   * Save board page to the HTML file
   */
  private async saveBoardPage(boardPage: BoardPage, pageName: string): Promise<void> {
    const html = this.compileTemplate(boardPage);

    await FilesystemOperator.overwriteFile([boardPage.board.url, `${pageName}${Constants.HTML_SUFFIX}`], html);
  }

  /**
   * Stringify page to pug template
   */
  private compileTemplate(boardPage: BoardPage): string {
    const compiledFunction = pug.compileFile(path.join(Constants.Paths.TEMPLATES, this.template));

    return compiledFunction({ ...boardPage, SITE_SETTINGS: () => global.GLOBAL_SETTINGS, getRandomBanner });
  }
}
