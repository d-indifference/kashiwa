import { CommonPage, CommonPageCommons } from '@library/misc/common-page';
import { Forms } from './forms';
import { ISession } from '@admin/interfaces';
import { LOCALE } from '@locale/locale';

/**
 * Page object with stringified HTML form
 */
export class RenderableFormPage extends CommonPage {
  /**
   * Stringified form
   */
  form: string;

  constructor(form: string, commons: CommonPageCommons) {
    super();
    this.form = form;
    this.commons = commons;
  }
}

/**
 * Page object with stringified HTML form and session
 */
export class RenderableSessionFormPage extends RenderableFormPage {
  /**
   * Session with payload
   */
  session: ISession;

  constructor(session: ISession, form: string, commons: CommonPageCommons) {
    super(form, commons);
    this.session = session;
  }
}

/**
 * Class for calling various methods to create an object to render a page with a predefined form
 */
export class FormPage {
  /**
   * Map form to page with form and page commons
   * @param form Form object
   * @param commons Page commons (title, subtitle, etc.)
   */
  public static toTemplateContent<T>(form: T, commons: CommonPageCommons): RenderableFormPage {
    const renderedForm = Forms.render(form);
    return new RenderableFormPage(renderedForm, commons);
  }

  /**
   * Map form to page with form, session and page commons
   * @param session Session object
   * @param form Form object
   * @param commons Page commons (title, subtitle, etc.)
   */
  public static toSessionTemplateContent<T>(
    session: ISession,
    form: T,
    commons: CommonPageCommons
  ): RenderableSessionFormPage {
    const renderedForm = Forms.render(form);
    return new RenderableSessionFormPage(session, renderedForm, commons);
  }

  /**
   * Map form to page with form, session, deletion option and page commons
   * @param session Session object
   * @param form Form object
   * @param deletionLink Link to post method with object deletion
   * @param commons Page commons (title, subtitle, etc.)
   */
  public static toEntityEditForm<T>(
    session: ISession,
    form: T,
    deletionLink: string,
    commons: CommonPageCommons
  ): RenderableSessionFormPage {
    const renderedForm = Forms.render(form);
    const deletionForm = `<hr><div align="center"><form method="post" action="${deletionLink}"><input type="submit" value="${LOCALE.DELETE as string}"></form></div>`;

    return new RenderableSessionFormPage(session, renderedForm + deletionForm, commons);
  }
}
