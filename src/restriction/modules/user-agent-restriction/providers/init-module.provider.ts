import { Injectable, OnModuleInit } from '@nestjs/common';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { UserAgentRestrictionModule } from '@restriction/modules/user-agent-restriction/user-agent-restriction.module';
import { Constants } from '@library/constants';

@Injectable()
export class InitModuleProvider implements OnModuleInit {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly siteContext: SiteContextProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(`${UserAgentRestrictionModule.name}.${InitModuleProvider.name}`);
  }

  public onModuleInit(): void {
    this.extractFromFile().then();
  }

  private async extractFromFile(): Promise<void> {
    this.logger.info('extractFromFile');

    const storageFileContent = await this.readFile();
    this.siteContext.setForbiddenUserAgents(this.compileRegExps(storageFileContent));
  }

  private compileRegExps(regExpsSources: string[]): RegExp[] {
    return regExpsSources.map(pattern => new RegExp(pattern, 'i'));
  }

  private async readFile(): Promise<string[]> {
    const fileRelativePath = [Constants.SETTINGS_DIR, Constants.FILE_FORBIDDEN_USER_AGENTS];

    const isFileExists = await this.fileSystem.pathExists(fileRelativePath);

    if (isFileExists) {
      const fileContent = await this.fileSystem.readTextFile(fileRelativePath);

      return fileContent.split('\r\n').filter(str => str !== '');
    }

    return [];
  }
}
