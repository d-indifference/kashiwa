import { ISession } from '../interfaces';
import { CommonPage, CommonPageCommons } from '@library/misc';

export class SessionPage extends CommonPage {
  /**
   * Session object
   */
  public session: ISession;

  constructor(session: ISession, commons: CommonPageCommons) {
    super();
    this.commons = commons;
    this.session = session;
  }
}

export * from './dashboard.page';
export * from './table.page';
