import { CommonPage } from '@library/misc/common-page';

/**
 * Page for `error.pug` template
 */
export class ErrorPage extends CommonPage {
  /**
   * Error message
   */
  message: string | object;

  /**
   * @param pageTitle Page title (for `<title>...</title>`)
   * @param message Error message
   */
  constructor(pageTitle: string, message: string | object) {
    super();
    this.message = message;
    this.commons = { pageTitle };
  }
}
