import { Injectable } from '@nestjs/common';
import { ISession } from '@admin/interfaces';
import { FilesystemOperator } from '@library/filesystem';
import { Response } from 'express';
import { IpFilterForm } from '@admin/forms/ip-filter';
import { IpFilterPage } from '@admin/pages/ip-filter';

/**
 * Service for handling of the IP denylist form
 */
@Injectable()
export class IpFilterService {
  /**
   * Load denylist to form
   * @param session Session object
   */
  public renderFormContent(session: ISession): IpFilterPage {
    const blackListStr = FilesystemOperator.readFile('_settings', 'black_list');

    return new IpFilterPage(session, blackListStr);
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
    await FilesystemOperator.overwriteFile(['_settings', 'black_list'], form.blackList);

    res.redirect('/kashiwa/ip-filter');
  }
}
