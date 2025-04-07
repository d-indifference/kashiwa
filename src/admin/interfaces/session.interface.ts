import { Cookie } from 'express-session';
import { ISessionPayload } from '@admin/interfaces/session-payload.interface';

export interface ISession {
  cookie: Cookie;

  payload: ISessionPayload;
}
