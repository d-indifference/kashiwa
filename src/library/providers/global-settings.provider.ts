import { Injectable } from '@nestjs/common';
import { FileSystemProvider } from '@library/providers/index';
import path from 'node:path';
import { Constants } from '@library/constants';
import { GlobalSettingsForm } from '@admin/forms';

/**
 * Provider for global setting uploading
 */
@Injectable()
export class GlobalSettingsProvider {
  constructor(private readonly fileSystem: FileSystemProvider) {}

  /**
   * Load global site settings to memory.
   * If global settings aren't presented, loads it from preset
   */
  public async load(): Promise<void> {
    const filePath = [Constants.SETTINGS_DIR, Constants.FILE_GLOBAL_SETTINGS];

    if (!(await this.fileSystem.pathExists(filePath))) {
      const presetPath = path.join(Constants.Paths.PRESETS, Constants.FILE_GLOBAL_SETTINGS);

      await this.fileSystem.copyPath(presetPath, filePath);
    }
    const fileContent = await this.fileSystem.readTextFile(filePath);

    global.GLOBAL_SETTINGS = JSON.parse(fileContent) as GlobalSettingsForm;
  }
}
