import { CommonPage } from '@library/misc/common-page';

export class ErrorPage extends CommonPage {
  message: string | object;

  constructor(pageTitle: string, message: string | object) {
    super();
    this.message = message;
    this.commons = { pageTitle };
  }
}
