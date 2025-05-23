import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Constants } from '@library/constants';
import { ConfigService } from '@nestjs/config';
import { FilesystemOperator } from '@library/filesystem';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { sessionConfig } from '@config/session.config';
import { IpFilterGuard, loadBlackList } from '@library/guards';
import { loadGlobalSettings } from '@library/functions';
import { getRandomBanner } from '@library/page-compiler';
import { LOCALE } from '@locale/locale';
import { PinoLogger, Logger } from 'nestjs-pino';
import { Logger as NestLogger } from '@nestjs/common';
import { ExceptionFilter } from '@library/filters';
import { loggerConfig } from '@config/logger.config';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  const port = config.getOrThrow<number>('http.port');

  app.useStaticAssets(Constants.Paths.STATIC);
  app.setBaseViewsDir(Constants.Paths.TEMPLATES);
  app.setViewEngine('pug');

  app.use(cookieParser());
  app.use(session(sessionConfig(config)));

  await FilesystemOperator.mkdir(Constants.SETTINGS_DIR);

  const logger = app.get(Logger);

  app.useGlobalFilters(new ExceptionFilter(new PinoLogger(loggerConfig())));

  await loadBlackList();
  await loadGlobalSettings();

  app.setLocal('SITE_SETTINGS', () => global.GLOBAL_SETTINGS);
  app.setLocal('LOCALE', LOCALE);
  app.setLocal('getRandomBanner', getRandomBanner);

  app.useGlobalGuards(new IpFilterGuard());
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  app.useLogger(logger);

  await app.listen(port);

  NestLogger.log(`Application is successfully running on port: ${port}`);
};

bootstrap().then();
