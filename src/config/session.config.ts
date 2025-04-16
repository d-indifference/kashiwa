import { ConfigService } from '@nestjs/config';
import { SessionOptions } from 'express-session';

export const sessionConfig = (config: ConfigService): SessionOptions => ({
  secret: config.getOrThrow<string>('secure.session.secret'),
  resave: false,
  saveUninitialized: false
});
