import { Cookie } from 'express-session';
import { ISessionPayload } from './session-payload.interface';

/**
 * `express-session` object with authentication payload
 */
export interface ISession {
  /**
   * `express-session` cookie object
   */
  cookie: Cookie;

  /**
   * Session payload object
   */
  payload: ISessionPayload;
}
