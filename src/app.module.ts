import { Module } from '@nestjs/common';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { LibraryModule } from '@library/library.module';
import { ConfigModule } from '@nestjs/config';
import applicationConfig from '@config/configuration.config';
import { AdminModule } from '@admin/admin.module';
import { PostingModule } from '@posting/posting.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      load: [applicationConfig],
      isGlobal: true
    }),
    NestjsFormDataModule.config({
      storage: MemoryStoredFile,
      cleanupAfterSuccessHandle: true,
      cleanupAfterFailedHandle: true
    }),
    LibraryModule,
    AdminModule,
    PostingModule
  ],
  providers: []
})
export class AppModule {}
