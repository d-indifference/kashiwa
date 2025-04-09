import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { AuthController, BoardController, DashboardController, StaffController } from '@admin/controllers';
import { PersistenceModule } from '@persistence/persistence.module';
import { AuthService, BoardService, DashboardService, StaffService } from '@admin/services';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { PrismaService } from '@persistence/lib';
import { nestjsFormDataConfig } from '@config/nestjs-form-data.config';

/**
 * Module for administration / moderation panel
 */
@Module({
  imports: [NestjsFormDataModule.config(nestjsFormDataConfig), LibraryModule, PersistenceModule],
  providers: [PrismaService, AuthService, DashboardService, StaffService, BoardService],
  controllers: [AuthController, DashboardController, StaffController, BoardController]
})
export class AdminModule {}
