import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { AuthController, DashboardController } from '@admin/controllers';
import { PersistenceModule } from '@persistence/persistence.module';
import { AuthService } from '@admin/services';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [
    NestjsFormDataModule.config({
      storage: MemoryStoredFile,
      cleanupAfterSuccessHandle: true,
      cleanupAfterFailedHandle: true
    }),
    LibraryModule,
    PersistenceModule
  ],
  providers: [AuthService],
  controllers: [AuthController, DashboardController]
})
export class AdminModule {}
