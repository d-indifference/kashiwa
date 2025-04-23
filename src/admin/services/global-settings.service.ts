import { Injectable } from '@nestjs/common';
import { GlobalSettingsForm } from '@admin/forms/global-settings';
import { Response } from 'express';
import { FilesystemOperator } from '@library/filesystem';
import { Constants } from '@library/constants';
import { FormPage } from '@admin/pages';
import { ISession } from '@admin/interfaces';

/**
 * Service for form operations with the global settings object
 */
@Injectable()
export class GlobalSettingsService {
  /**
   * Get global settings to the form
   * @param session Session object
   */
  public getGlobalSettings(session: ISession): FormPage<GlobalSettingsForm> {
    return new FormPage(session, 'UPDATE', global.GLOBAL_SETTINGS);
  }

  /**
   * Save global settings from the form
   * @param form Form object
   * @param res `Express.js object`
   */
  public async saveGlobalSettings(form: GlobalSettingsForm, res: Response): Promise<void> {
    global.GLOBAL_SETTINGS = form;

    await FilesystemOperator.overwriteFile(['_settings', Constants.FILE_GLOBAL_SETTINGS], JSON.stringify(form));

    res.redirect('/kashiwa/global-settings');
  }
}
