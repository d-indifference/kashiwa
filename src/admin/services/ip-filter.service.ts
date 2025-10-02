import { ISession } from '@admin/interfaces';
import { Injectable } from '@nestjs/common';
import { FormPage, RenderableSessionFormPage } from '@admin/lib';
import { IpFilterForm } from '@admin/forms';
import { LOCALE } from '@locale/locale';
import { Constants } from '@library/constants';
import { Response } from 'express';
import { FileSystemProvider, IpBlacklistProvider, SiteContextProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';

/**
 * Service for handling of the IP denylist form
 */
@Injectable()
export class IpFilterService {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly ipBlacklist: IpBlacklistProvider,
    private readonly siteContext: SiteContextProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(IpFilterService.name);
  }

  /**
   * Load denylist to form
   * @param session Session object
   */
  public async renderFormContent(session: ISession): Promise<RenderableSessionFormPage> {
    this.logger.debug({ session }, 'renderFormContent');

    const form = new IpFilterForm();
    form.blackList = await this.readBlackList();

    return FormPage.toSessionTemplateContent(session, form, {
      pageTitle: LOCALE.IP_FILTER as string,
      pageSubtitle: LOCALE.EDIT_IP_BLACKLIST as string,
      goBack: '/kashiwa'
    });
  }

  /**
   * Denylist form saving handler
   * @param form Form from IP filter settings
   * @param res `Express.js` response
   */
  public async saveIpFilter(form: IpFilterForm, res: Response): Promise<void> {
    this.logger.info({ form }, 'saveIpFilter');

    const ipFilterList = form.blackList.split('\r\n').filter(str => str !== '');

    this.siteContext.setIpBlackList(ipFilterList);
    await this.overwriteBlackList(form);
    this.ipBlacklist.reloadBlacklist();

    res.redirect('/kashiwa/ip-filter');
  }

  /**
   * Get the blacklist file content
   */
  private async readBlackList(): Promise<string> {
    return await this.fileSystem.readTextFile([Constants.SETTINGS_DIR, Constants.BLACK_LIST_FILE_NAME]);
  }

  /**
   * Overwrite the blacklist file by form content
   */
  private async overwriteBlackList(form: IpFilterForm): Promise<void> {
    const content = form.blackList;
    await this.fileSystem.writeTextFile([Constants.SETTINGS_DIR, Constants.BLACK_LIST_FILE_NAME], content);
  }
}
