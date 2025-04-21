import { Injectable } from '@nestjs/common';
import { ISession } from '@admin/interfaces';
import { SpamPage } from '@admin/pages/spam';
import { FilesystemOperator } from '@library/filesystem';
import { SpamForm } from '@admin/forms/spam';
import { Response } from 'express';

/**
 * Service for handling of the spam list form
 */
@Injectable()
export class SpamService {
  /**
   * Load the spam list to form
   * @param session Session object
   */
  public renderFormContent(session: ISession): SpamPage {
    const spamListStr = FilesystemOperator.readFile('_settings', 'spam');

    return new SpamPage(session, spamListStr);
  }

  /**
   * Spam list form saving handler
   * @param form Form from spam list settings
   * @param res `Express.js` response
   */
  public async saveSpamList(form: SpamForm, res: Response): Promise<void> {
    const spamList = form.spamList.split('\r\n');

    if (spamList.at(-1) === '') {
      spamList.pop();
    }

    global.spamExpressions = spamList;
    await FilesystemOperator.overwriteFile(['_settings', 'spam'], form.spamList);

    res.redirect('/kashiwa/spam');
  }
}
