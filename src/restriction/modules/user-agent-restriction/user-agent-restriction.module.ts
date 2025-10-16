import { forwardRef, Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { ForbiddenUserAgentsProvider, InitModuleProvider } from '@restriction/modules/user-agent-restriction/providers';

@Module({
  imports: [forwardRef(() => LibraryModule)],
  providers: [InitModuleProvider, ForbiddenUserAgentsProvider],
  exports: [ForbiddenUserAgentsProvider]
})
export class UserAgentRestrictionModule {}
