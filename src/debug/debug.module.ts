import { forwardRef, Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { DebugService } from '@debug/services';
import { DebugController } from '@debug/controllers';

@Module({
  imports: [forwardRef(() => LibraryModule)],
  providers: [DebugService],
  controllers: [DebugController]
})
export class DebugModule {}
