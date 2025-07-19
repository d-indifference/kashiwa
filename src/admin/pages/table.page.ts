import { SessionPage } from '@admin/pages/index';
import { ISession } from '@admin/interfaces';
import { CommonPageCommons } from '@library/misc';

/**
 * Object for pre-rendered page of Prisma entities mapped as HTML table
 */
export class TablePage extends SessionPage {
  /**
   * Pre-rendered HTML table
   */
  tableHtml: string;

  /**
   * @param tableHtml Pre-rendered HTML table
   * @param session Session object
   * @param commons Page commons (title, subtitle, etc.)
   */
  constructor(tableHtml: string, session: ISession, commons: CommonPageCommons) {
    super(session, commons);
    this.tableHtml = tableHtml;
  }
}
