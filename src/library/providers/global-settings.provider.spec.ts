import { GlobalSettingsProvider } from './global-settings.provider';
import * as path from 'node:path';
import * as process from 'node:process';

const Constants = {
  SETTINGS_DIR: '_settings',
  FILE_GLOBAL_SETTINGS: 'global-settings',
  Paths: {
    PRESETS: path.join(process.cwd(), '.presets')
  }
};
const mockFileSystem = {
  pathExists: jest.fn(),
  copyPath: jest.fn(),
  readTextFile: jest.fn()
};
const mockSiteContext = {
  setGlobalSettings: jest.fn()
};

const mockSettingsForm = { foo: 'bar', baz: 123 };

describe('GlobalSettingsProvider', () => {
  let provider: GlobalSettingsProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new GlobalSettingsProvider(mockFileSystem as any, mockSiteContext as any);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should load settings from preset if not exist', async () => {
    mockFileSystem.pathExists.mockResolvedValue(false);
    mockFileSystem.copyPath.mockResolvedValue(undefined);
    mockFileSystem.readTextFile.mockResolvedValue(JSON.stringify(mockSettingsForm));

    await provider.load();

    expect(mockFileSystem.pathExists).toHaveBeenCalledWith([Constants.SETTINGS_DIR, Constants.FILE_GLOBAL_SETTINGS]);
    expect(mockFileSystem.copyPath).toHaveBeenCalledWith(
      `${Constants.Paths.PRESETS}${path.sep}${Constants.FILE_GLOBAL_SETTINGS}`,
      [Constants.SETTINGS_DIR, Constants.FILE_GLOBAL_SETTINGS]
    );
    expect(mockFileSystem.readTextFile).toHaveBeenCalledWith([Constants.SETTINGS_DIR, Constants.FILE_GLOBAL_SETTINGS]);
    expect(mockSiteContext.setGlobalSettings).toHaveBeenCalledWith(mockSettingsForm);
  });

  it('should load settings directly if file exists', async () => {
    mockFileSystem.pathExists.mockResolvedValue(true);
    mockFileSystem.readTextFile.mockResolvedValue(JSON.stringify(mockSettingsForm));

    await provider.load();

    expect(mockFileSystem.pathExists).toHaveBeenCalledWith([Constants.SETTINGS_DIR, Constants.FILE_GLOBAL_SETTINGS]);
    expect(mockFileSystem.copyPath).not.toHaveBeenCalled();
    expect(mockFileSystem.readTextFile).toHaveBeenCalledWith([Constants.SETTINGS_DIR, Constants.FILE_GLOBAL_SETTINGS]);
    expect(mockSiteContext.setGlobalSettings).toHaveBeenCalledWith(mockSettingsForm);
  });
});
