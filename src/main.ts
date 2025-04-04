import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Constants } from '@library/constants';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { FilesystemOperator } from '@library/filesystem';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get(ConfigService);

  const port = config.getOrThrow<number>('http.port');

  app.useStaticAssets(Constants.Paths.STATIC);
  app.setBaseViewsDir(Constants.Paths.TEMPLATES);
  app.setViewEngine('pug');

  await FilesystemOperator.mkdir(Constants.SETTINGS_DIR);

  await app.listen(port);

  Logger.log(`Application is successfully running on port: ${port}`);
};

bootstrap().then();
