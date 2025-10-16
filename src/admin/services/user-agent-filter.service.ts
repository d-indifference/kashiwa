import { Injectable } from '@nestjs/common';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { ForbiddenUserAgentsProvider } from '@restriction/modules/user-agent-restriction/providers';
import { PinoLogger } from 'nestjs-pino';
import { ISession } from '@admin/interfaces';
import { FormPage, RenderableSessionFormPage } from '@admin/lib';
import { UserAgentForm } from '@admin/forms';
import { LOCALE } from '@locale/locale';
import { Response } from 'express';
import { Constants } from '@library/constants';

@Injectable()
export class UserAgentFilterService {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly forbiddenUserAgentsProvider: ForbiddenUserAgentsProvider,
    private readonly siteContext: SiteContextProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(UserAgentFilterService.name);
  }

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

  private compileRegExps(regExpsSources: string[]): RegExp[] {
    return regExpsSources.map(pattern => new RegExp(pattern, 'i'));
  }
}
