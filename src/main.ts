import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Constants } from '@library/constants';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { sessionConfig } from '@config/session.config';
import { IpFilterGuard } from '@library/guards';
import { LOCALE } from '@locale/locale';
import { PinoLogger, Logger } from 'nestjs-pino';
import { Logger as NestLogger } from '@nestjs/common';
import { ExceptionFilter } from '@library/filters';
import { loggerConfig } from '@config/logger.config';
import { applicationVersion, fileSize, getRandomBanner } from '@library/helpers';
import { FileSystemProvider, GlobalSettingsProvider, IpBlacklistProvider } from '@library/providers';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  const port = config.getOrThrow<number>('http.port');

  app.useStaticAssets(Constants.Paths.STATIC);
  app.setBaseViewsDir(Constants.Paths.TEMPLATES);
  app.setViewEngine('pug');

  app.use(cookieParser());
  app.use(session(sessionConfig(config)));

  const fileSystem = new FileSystemProvider();
  await fileSystem.ensureDir([Constants.SETTINGS_DIR]);

  const logger = app.get(Logger);

  app.useGlobalFilters(new ExceptionFilter(new PinoLogger(loggerConfig())));

  app.setLocal('SITE_SETTINGS', () => global.GLOBAL_SETTINGS);
  app.setLocal('LOCALE', LOCALE);
  app.setLocal('getRandomBanner', getRandomBanner);
  app.setLocal('applicationVersion', applicationVersion);
  app.setLocal('fileSize', fileSize);

  const ipFilterGuard = new IpFilterGuard(fileSystem, new IpBlacklistProvider());
  app.useGlobalGuards(ipFilterGuard);
  await ipFilterGuard.load();

  const globalSettingsProvider = app.get(GlobalSettingsProvider);
  await globalSettingsProvider.load();

  app.getHttpAdapter().getInstance().set('trust proxy', true);

  app.useLogger(logger);

  await app.listen(port);

  NestLogger.log(`Application is successfully running on port: ${port}`);
};

bootstrap().then();
