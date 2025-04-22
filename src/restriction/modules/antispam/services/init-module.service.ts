import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fsExtra from 'fs-extra';
import { Constants } from '@library/constants';
import * as path from 'node:path';
import * as process from 'node:process';
import { FilesystemOperator } from '@library/filesystem';

/**
 * Service for antispam module initialization
 */
@Injectable()
export class InitModuleService implements OnModuleInit {
  public onModuleInit() {
    this.activateSpamBase().then();
  }

  /** Activates spam base. If spam base does not exist, take it from presets */
  private async activateSpamBase(): Promise<void> {
    if (!(await fsExtra.exists(Constants.Paths.FILE_SPAM))) {
      await this.initSpamFile();
    }
    await this.readSpamFile();
  }

  /** Read custom spam base and load it to globals */
  private async readSpamFile(): Promise<void> {
    const payloadBuffer = await fsExtra.readFile(Constants.Paths.FILE_SPAM);
    const spamFileContent = payloadBuffer.toString('utf-8');

    global.spamExpressions = spamFileContent.split('\r\n');
    global.spamExpressions.pop();
  }

  /** Get spam base from presets */
  private async initSpamFile(): Promise<void> {
    const payloadBuffer = await fsExtra.readFile(path.join(process.cwd(), '.presets', 'spam'));
    const spamPresetFileContent = payloadBuffer.toString('utf-8');

    const spamList = spamPresetFileContent.replaceAll('\n', '\r\n');

    await FilesystemOperator.overwriteFile(['_settings', 'spam'], spamList);
  }
}
