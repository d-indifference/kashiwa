import { ISession } from '@admin/interfaces';
import { Page } from '@persistence/lib/page';

/**
 * Abstract class for admin panel page
 */
export abstract class SessionPage {
  /**
   * Session object
   */
  public session: ISession;

  protected constructor(session: ISession) {
    this.session = session;
  }
}

/**
 * Page for default paginated lists of objects
 */
export class ListPage<T> extends SessionPage {
  content: Page<T>;

  constructor(session: ISession, content: Page<T>) {
    super(session);
    this.content = content;
  }
}

/**
 * Page for default object multi-functional forms (create / update)
 */
export class FormPage<T> extends SessionPage {
  formType: 'CREATE' | 'UPDATE';

  content?: T;

  constructor(session: ISession, fromType: 'CREATE' | 'UPDATE', content?: T) {
    super(session);
    this.formType = fromType;
    this.content = content;
  }
}
