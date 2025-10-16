import { Injectable } from '@nestjs/common';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { ISession } from '@admin/interfaces';
import { FormPage, RenderableSessionFormPage } from '@admin/lib';
import { UserAgentForm } from '@admin/forms';
import { LOCALE } from '@locale/locale';
import { Response } from 'express';
import { Constants } from '@library/constants';

/**
 * Service responsible for managing and persisting the list of forbidden user agents
 */
@Injectable()
export class UserAgentFilterService {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly siteContext: SiteContextProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(UserAgentFilterService.name);
  }

  /**
   * Renders the form page content used for configuring the list of forbidden user agents
   * @param session The current user session.
   */
  public renderFormContent(session: ISession): RenderableSessionFormPage {
    this.logger.debug({ session }, 'renderFormContent');

    const form = new UserAgentForm();
    form.forbiddenUserAgents = (this.siteContext.getForbiddenUserAgents() ?? []).join('\r\n');

    return FormPage.toSessionTemplateContent(session, form, {
      pageTitle: LOCALE.BLOCKED_USER_AGENTS_LIST as string,
      pageSubtitle: LOCALE.EDIT_BLOCKED_USER_AGENTS as string,
      goBack: '/kashiwa'
    });
  }

  /**
   * Saves the updated list of forbidden user agents and applies it to the application context
   * @param form Submitted form containing the forbidden user agents list
   * @param res Express response object used to redirect after saving
   */
  public async saveUserAgentList(form: UserAgentForm, res: Response): Promise<void> {
    this.logger.info({ form }, 'saveUserAgentList');

    const forbiddenUserAgents = form.forbiddenUserAgents.split('\r\n').filter(str => str !== '');

    await this.fileSystem.writeTextFile(
      [Constants.SETTINGS_DIR, Constants.FILE_FORBIDDEN_USER_AGENTS],
      form.forbiddenUserAgents
    );
    this.siteContext.setForbiddenUserAgents(this.compileRegExps(forbiddenUserAgents));

    res.redirect('/kashiwa/user-agents');
  }

  /**
   * Compiles a list of user agent patterns into case-insensitive regular expressions
   */
  private compileRegExps(regExpsSources: string[]): RegExp[] {
    return regExpsSources.map(pattern => new RegExp(pattern, 'i'));
  }
}
