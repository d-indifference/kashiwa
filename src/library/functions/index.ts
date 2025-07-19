import { FilesystemOperator } from '@library/filesystem';
import { Constants } from '@library/constants';
import * as path from 'node:path';
import * as fsExtra from 'fs-extra';
import * as process from 'node:process';
import { GlobalSettingsForm } from '@admin/forms';

/**
 * Load global settings from the file. If the file is empty, load it from presets
 */
export const loadGlobalSettings = async (): Promise<void> => {
  const filePath = path.join(Constants.Paths.SETTINGS, Constants.FILE_GLOBAL_SETTINGS);

  if (!(await fsExtra.pathExists(filePath))) {
    const presetPath = path.join(process.cwd(), '.presets', Constants.FILE_GLOBAL_SETTINGS);

    await fsExtra.copy(presetPath, filePath);
  }
  const fileContent = FilesystemOperator.readFile('_settings', Constants.FILE_GLOBAL_SETTINGS);

  global.GLOBAL_SETTINGS = JSON.parse(fileContent) as GlobalSettingsForm;
};
