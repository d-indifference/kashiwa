import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ISession } from '../interfaces';
import { LOCALE } from '@locale/locale';
import * as fsExtra from 'fs-extra';
import { Constants } from '@library/constants';
import * as path from 'path';
import { FormPage, RenderableSessionFormPage } from '@admin/lib';
import { GlobalSettingsForm } from '@admin/forms';

/**
 * Service for form operations with the global settings object
 */
@Injectable()
export class GlobalSettingsService {
  /**
   * Get global settings to the form
   * @param session Session object
   */
  public getGlobalSettings(session: ISession): RenderableSessionFormPage {
    return FormPage.toSessionTemplateContent(
      session,
      GlobalSettingsForm.fromGlobalSettings(
        global.GLOBAL_SETTINGS as Pick<GlobalSettingsForm, keyof GlobalSettingsForm>
      ),
      {
        pageSubtitle: LOCALE['EDIT_SITE_SETTINGS'] as string,
        pageTitle: LOCALE['SITE_SETTINGS'] as string,
        goBack: '/kashiwa'
      }
    );
  }

  /**
   * Save global settings from the form
   * @param form Form object
   * @param res `Express.js object`
   */
  public async saveGlobalSettings(form: GlobalSettingsForm, res: Response): Promise<void> {
    global.GLOBAL_SETTINGS = form;

    await this.overwriteSettingsFile(form);

    res.redirect('/kashiwa/global-settings');
  }

  private async overwriteSettingsFile(form: GlobalSettingsForm): Promise<void> {
    const content = JSON.stringify(form);
    const fullPathToSettings = path.join(Constants.Paths.SETTINGS, Constants.FILE_GLOBAL_SETTINGS);
    await fsExtra.writeFile(fullPathToSettings, content, { encoding: 'utf-8' });
  }
}
