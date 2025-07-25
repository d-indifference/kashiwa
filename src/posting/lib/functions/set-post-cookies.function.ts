import { Response } from 'express';
import { ReplyCreateForm, ThreadCreateForm } from '@posting/forms';
import { Constants } from '@library/constants';

/**
 * Ser response cookies for password, name and email
 * @param form Posting form object
 * @param password Password from form or generated
 * @param res `Express.js` response
 */
export const setPostCookies = (form: ThreadCreateForm | ReplyCreateForm, password: string, res: Response): void => {
  res.cookie('kashiwa_pass', password, { maxAge: Constants.COOKIES_10_YEARS });

  if (form.name) {
    res.cookie('kashiwa_name', form.name, { maxAge: Constants.COOKIES_10_YEARS });
  } else {
    res.cookie('kashiwa_name', '', { maxAge: Constants.COOKIES_ERASING_VALUE });
  }

  if (form.email) {
    res.cookie('kashiwa_email', form.email, { maxAge: Constants.COOKIES_10_YEARS });
  } else {
    res.cookie('kashiwa_email', '', { maxAge: Constants.COOKIES_ERASING_VALUE });
  }
};
