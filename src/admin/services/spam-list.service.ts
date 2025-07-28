import { Injectable } from '@nestjs/common';
import { Constants } from '@library/constants';
import { LOCALE } from '@locale/locale';
import { Response } from 'express';
import { SpamListForm } from '@admin/forms';
import { FormPage, RenderableSessionFormPage } from '@admin/lib';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { ISession } from '@admin/interfaces';
import { AntiSpamService } from '@restriction/modules/antispam/services';

/**
 * Service for handling of the spam list form
 */
@Injectable()
export class SpamListService {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly siteContext: SiteContextProvider,
    private readonly antiSpamService: AntiSpamService
  ) {}

  /**
   * Load the spam list to form
   * @param session Session object
   */
  public async renderFormContent(session: ISession): Promise<RenderableSessionFormPage> {
    const form = new SpamListForm();
    form.spamList = await this.readSpamList();

    return FormPage.toSessionTemplateContent(session, form, {
      pageTitle: LOCALE.SPAM_LIST as string,
      pageSubtitle: LOCALE.EDIT_SPAM_LIST as string,
      goBack: '/kashiwa'
    });
  }

  /**
   * Spam list form saving handler
   * @param form Form from spam list settings
   * @param res `Express.js` response
   */
  public async saveSpamList(form: SpamListForm, res: Response): Promise<void> {
    const spamList = form.spamList.split('\r\n');

    if (spamList.at(-1) === '') {
      spamList.pop();
    }

    this.siteContext.setSpamExpressions(spamList);
    await this.overwriteSpamList(form);
    this.antiSpamService.compileSpamRegexes();

    res.redirect('/kashiwa/spam');
  }

  /**
   * Get the spam list file content
   */
  private async readSpamList(): Promise<string> {
    return await this.fileSystem.readTextFile([Constants.SETTINGS_DIR, Constants.SPAM_FILE_NAME]);
  }

  /**
   * Overwrite the spam list file by form content
   */
  private async overwriteSpamList(form: SpamListForm): Promise<void> {
    const content = form.spamList;
    await this.fileSystem.writeTextFile([Constants.SETTINGS_DIR, Constants.SPAM_FILE_NAME], content);
  }
}
