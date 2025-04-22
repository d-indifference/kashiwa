import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Constants } from '@library/constants';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { FilesystemOperator } from '@library/filesystem';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { sessionConfig } from '@config/session.config';
import {
  BadRequestExceptionFilter,
  ForbiddenExceptionFilter,
  InternalServerErrorExceptionFilter,
  NotFoundExceptionFilter,
  UnauthorizedExceptionFilter
} from '@library/filters';
import { IpFilterGuard, loadBlackList } from '@library/guards';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get(ConfigService);

  const port = config.getOrThrow<number>('http.port');

  app.useStaticAssets(Constants.Paths.STATIC);
  app.setBaseViewsDir(Constants.Paths.TEMPLATES);
  app.setViewEngine('pug');

  app.use(cookieParser());
  app.use(session(sessionConfig(config)));

  await FilesystemOperator.mkdir(Constants.SETTINGS_DIR);

  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.useGlobalFilters(new InternalServerErrorExceptionFilter());
  app.useGlobalFilters(new BadRequestExceptionFilter());
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  app.useGlobalFilters(new ForbiddenExceptionFilter());

  await loadBlackList();

  app.useGlobalGuards(new IpFilterGuard());
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  await app.listen(port);

  Logger.log(`Application is successfully running on port: ${port}`);
};

bootstrap().then();
