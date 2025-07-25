import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ISession } from '../interfaces';
import { LOCALE } from '@locale/locale';
import { Constants } from '@library/constants';
import { FormPage, RenderableSessionFormPage } from '@admin/lib';
import { GlobalSettingsForm } from '@admin/forms';
import { FileSystemProvider } from '@library/providers';

/**
 * Service for form operations with the global settings object
 */
@Injectable()
export class GlobalSettingsService {
  constructor(private readonly fileSystem: FileSystemProvider) {}

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
    await this.fileSystem.writeTextFile([Constants.SETTINGS_DIR, Constants.FILE_GLOBAL_SETTINGS], content);
  }
}
