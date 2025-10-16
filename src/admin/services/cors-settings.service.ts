import { Injectable } from '@nestjs/common';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { ISession } from '@admin/interfaces';
import { FormPage, RenderableSessionFormPage } from '@admin/lib';
import { CorsSettingsForm } from '@admin/forms';
import { LOCALE } from '@locale/locale';
import { Response } from 'express';
import { Constants } from '@library/constants';

/**
 * Service responsible for rendering and saving the CORS settings form in the administrative interface.
 */
@Injectable()
export class CorsSettingsService {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly siteContext: SiteContextProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(CorsSettingsService.name);
  }

  /**
   * Renders the CORS settings form page for a given user session
   * @param session Current user session
   */
  public renderFormContent(session: ISession): RenderableSessionFormPage {
    this.logger.debug({ session }, 'renderFormContent');

    const form = new CorsSettingsForm();
    const allowedOrigins = this.siteContext.getCorsAllowedOrigins();

    form.allowedOrigins = allowedOrigins ? allowedOrigins.join('\r\n') : '';

    return FormPage.toSessionTemplateContent(session, form, {
      pageTitle: LOCALE.CORS_SETTINGS as string,
      pageSubtitle: LOCALE.EDIT_CORS_SETTINGS as string,
      goBack: '/kashiwa'
    });
  }

  /**
   * Saves updated CORS settings submitted through the admin form
   * @param form Submitted CORS settings form data
   * @param res `Express.js` response object used for redirection
   */
  public async saveCorsSettings(form: CorsSettingsForm, res: Response): Promise<void> {
    this.logger.info({ form }, 'saveIpFilter');

    const allowedOriginsList = form.allowedOrigins.split('\r\n').filter(str => str !== '');

    this.siteContext.setCorsAllowedOrigins(allowedOriginsList);
    await this.fileSystem.writeTextFile([Constants.SETTINGS_DIR, Constants.FILE_ALLOWED_ORIGINS], form.allowedOrigins);

    res.redirect('/kashiwa/cors-settings');
  }
}
