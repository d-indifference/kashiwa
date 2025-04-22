import { SessionPage } from '@admin/pages';
import { ISession } from '@admin/interfaces';

/**
 * Page for the IP filter form
 */
export class IpFilterPage extends SessionPage {
  /**
   * List of banned IPs
   */
  blackList: string;

  constructor(session: ISession, spamList: string) {
    super(session);
    this.blackList = spamList;
  }
}
