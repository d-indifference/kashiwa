import { ISession } from '@admin/interfaces';
import { Injectable } from '@nestjs/common';
import { FormPage, RenderableSessionFormPage } from '@admin/lib';
import { IpFilterForm } from '@admin/forms';
import { LOCALE } from '@locale/locale';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { Constants } from '@library/constants';
import { Response } from 'express';

/**
 * Service for handling of the IP denylist form
 */
@Injectable()
export class IpFilterService {
  /**
   * Load denylist to form
   * @param session Session object
   */
  public async renderFormContent(session: ISession): Promise<RenderableSessionFormPage> {
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
    const ipFilterList = form.blackList.split('\r\n');

    if (ipFilterList.at(-1) === '') {
      ipFilterList.pop();
    }

    global.ipBlackList = ipFilterList;
    await this.overwriteSpamList(form);

    res.redirect('/kashiwa/ip-filter');
  }

  private async readBlackList(): Promise<string> {
    return await fsExtra.readFile(path.join(Constants.Paths.SETTINGS, 'black_list'), 'utf-8');
  }

  private async overwriteSpamList(form: IpFilterForm): Promise<void> {
    const content = form.blackList;
    await fsExtra.writeFile(path.join(Constants.Paths.SETTINGS, 'black_list'), content, { encoding: 'utf-8' });
  }
}
