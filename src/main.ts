import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'node:path';
import * as process from 'node:process';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(path.join(process.cwd(), 'templates'));
  app.setViewEngine('pug');

  await app.listen(process.env.PORT ?? 3000);
};

bootstrap().then();
