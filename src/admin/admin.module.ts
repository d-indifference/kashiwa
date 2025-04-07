import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { AuthController } from '@admin/controllers';

@Module({
  imports: [LibraryModule],
  providers: [],
  controllers: [AuthController]
})
export class AdminModule {}
