import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { AuthController } from '@admin/controllers';
import * as path from 'node:path';
import * as process from 'node:process';
import { PugModule } from '@library/pug';

@Module({
  imports: [
    LibraryModule,
    PugModule.forRoot({
      templatesPath: path.join(process.cwd(), 'src', 'admin', 'templates')
    })
  ],
  providers: [],
  controllers: [AuthController]
})
export class AdminModule {}
