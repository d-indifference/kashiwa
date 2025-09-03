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
import { applicationVersion, fileSize, getRandomBanner, truncateText } from '@library/helpers';
import {
  FileSystemProvider,
  GlobalSettingsProvider,
  IpBlacklistProvider,
  SiteContextProvider,
  SwaggerSetupProvider
} from '@library/providers';
import { AntiSpamService, InitModuleService } from '@restriction/modules/antispam/services';
import { SwaggerModule } from '@nestjs/swagger';
import * as process from 'node:process';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  const port = config.getOrThrow<number>('http.port');

  app.useStaticAssets(Constants.Paths.STATIC);
  app.setBaseViewsDir(Constants.Paths.TEMPLATES);
  app.setViewEngine('pug');

  app.use(cookieParser());
  app.use(session(sessionConfig(config)));

  const fileSystem = new FileSystemProvider(config);
  await fileSystem.ensureDir([Constants.SETTINGS_DIR]);

  const logger = app.get(Logger);

  app.useGlobalFilters(new ExceptionFilter(new PinoLogger(loggerConfig())));

  const siteContext = app.get(SiteContextProvider);

  app.setLocal('SITE_SETTINGS', () => siteContext.getGlobalSettings());
  app.setLocal('LOCALE', LOCALE);
  app.setLocal('getRandomBanner', getRandomBanner);
  app.setLocal('applicationVersion', applicationVersion);
  app.setLocal('fileSize', fileSize);
  app.setLocal('truncateText', truncateText);
  app.setLocal('HTML_SUFFIX', Constants.HTML_SUFFIX);

  const ipBlacklistProvider = app.get(IpBlacklistProvider);
  const ipFilterGuard = new IpFilterGuard(fileSystem, ipBlacklistProvider, siteContext);
  app.useGlobalGuards(ipFilterGuard);
  await ipFilterGuard.load();

  const globalSettingsProvider = new GlobalSettingsProvider(fileSystem, siteContext);
  await globalSettingsProvider.load();

  const antispamInit = app.get(InitModuleService);
  await antispamInit.activateSpamBase();

  const antiSpam = app.get(AntiSpamService);
  antiSpam.compileSpamRegexes();

  app.getHttpAdapter().getInstance().set('trust proxy', true);

  app.useLogger(logger);

  const swaggerUrl = `/api/${process.env.npm_package_version}/docs`;
  const swaggerSetupProvider = app.get(SwaggerSetupProvider);
  SwaggerModule.setup(swaggerUrl, app, swaggerSetupProvider.setupDocs(app));

  await app.listen(port);

  NestLogger.log(`Application is successfully running on port: ${port}, swagger: ${swaggerUrl}`);
};

bootstrap().then();
