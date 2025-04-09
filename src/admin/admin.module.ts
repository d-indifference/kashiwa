import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { AuthController, DashboardController, StaffController } from '@admin/controllers';
import { PersistenceModule } from '@persistence/persistence.module';
import { AuthService, DashboardService, StaffService } from '@admin/services';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { PrismaService } from '@persistence/lib';

/**
 * Module for administration / moderation panel
 */
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
  providers: [PrismaService, AuthService, DashboardService, StaffService],
  controllers: [AuthController, DashboardController, StaffController]
})
export class AdminModule {}
