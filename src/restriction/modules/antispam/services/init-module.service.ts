import { Injectable, OnModuleInit } from '@nestjs/common';
import { Constants } from '@library/constants';
import * as path from 'node:path';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';

/**
 * Service for antispam module initialization
 */
@Injectable()
export class InitModuleService implements OnModuleInit {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly siteContext: SiteContextProvider
  ) {}

  public onModuleInit() {
    this.activateSpamBase().then();
  }

  /** Activates spam base. If spam base does not exist, take it from presets */
  public async activateSpamBase(): Promise<void> {
    if (!(await this.fileSystem.pathExists([Constants.SETTINGS_DIR, Constants.SPAM_FILE_NAME]))) {
      await this.initSpamFile();
    }
    await this.readSpamFile();
  }

  /** Read custom spam base and load it to globals */
  private async readSpamFile(): Promise<void> {
    const spamFileContent = await this.fileSystem.readTextFile([Constants.SETTINGS_DIR, Constants.SPAM_FILE_NAME]);

    const spamExpressions = spamFileContent.split('\r\n').filter(str => str !== '');

    this.siteContext.setSpamExpressions(spamExpressions);
  }

  /** Get spam base from presets */
  private async initSpamFile(): Promise<void> {
    const spamPresetFileContent = await this.fileSystem.readTextFileOutOfVolume(
      path.join(Constants.Paths.PRESETS, Constants.SPAM_FILE_NAME)
    );

    const spamList = spamPresetFileContent
      .split('\n')
      .filter(str => str !== '')
      .join('\r\n');
    await this.fileSystem.writeTextFile([Constants.SETTINGS_DIR, Constants.SPAM_FILE_NAME], spamList);
  }
}
