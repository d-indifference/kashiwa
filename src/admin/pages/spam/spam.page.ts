import { SessionPage } from '@admin/pages';
import { ISession } from '@admin/interfaces';

/**
 * Page for the spam list form
 */
export class SpamPage extends SessionPage {
  /**
   * List of spam words
   */
  spamList: string;

  constructor(session: ISession, spamList: string) {
    super(session);
    this.spamList = spamList;
  }
}
