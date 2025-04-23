import { Injectable } from '@nestjs/common';
import * as pug from 'pug';
import * as path from 'node:path';
import { Constants } from '@library/constants';
import { applicationVersion, fileSize, formatDateTime, getRandomBanner } from '@library/page-compiler/helpers';
import { IPage } from '@library/page-compiler/interfaces/page.interface';
import { FilesystemOperator } from '@library/filesystem';

/**
 * Service for thread page saving on disk
 */
@Injectable()
export class ThreadPageCompilerService {
  private readonly template = 'thread.pug';

  /**
   * Saves thread HTML page on disk with content
   * @param content Thread page content
   */
  public async saveThreadPage(content: IPage): Promise<void> {
    const html = this.compileTemplate(content);

    await FilesystemOperator.mkdir(content.board.url, Constants.RES_DIR);

    await FilesystemOperator.overwriteFile(
      [content.board.url, Constants.RES_DIR, `${content.openingPost.num}${Constants.HTML_SUFFIX}`],
      html
    );
  }

  /**
   * Compile Pug template with provided content
   */
  private compileTemplate(content: IPage): string {
    const compiledFunction = pug.compileFile(path.join(Constants.Paths.TEMPLATES, this.template));

    return compiledFunction({
      fileSize,
      formatDateTime,
      applicationVersion,
      _CONTENT: content,
      SITE_SETTINGS: () => global.GLOBAL_SETTINGS,
      getRandomBanner
    });
  }
}
