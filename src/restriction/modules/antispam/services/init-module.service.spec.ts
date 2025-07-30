import { InitModuleService } from './init-module.service';
import * as path from 'node:path';
import * as process from 'node:process';

describe('InitModuleService', () => {
  let fileSystem: any;
  let siteContext: any;
  let service: InitModuleService;

  const SETTINGS_DIR = '_settings';
  const SPAM_FILE_NAME = 'spam';
  const PRESETS = path.join(process.cwd(), '.presets');

  beforeEach(() => {
    fileSystem = {
      pathExists: jest.fn(),
      readTextFile: jest.fn(),
      readTextFileOutOfVolume: jest.fn(),
      writeTextFile: jest.fn()
    };
    siteContext = {
      setSpamExpressions: jest.fn()
    };

    jest.mock('@library/constants', () => ({
      Constants: {
        SETTINGS_DIR,
        SPAM_FILE_NAME,
        Paths: { PRESETS }
      }
    }));

    service = new InitModuleService(fileSystem, siteContext);
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should call activateSpamBase', async () => {
      const activateSpamBaseSpy = jest.spyOn(service, 'activateSpamBase').mockResolvedValue(undefined);
      await service.onModuleInit();
      expect(activateSpamBaseSpy).toHaveBeenCalled();
    });
  });

  describe('activateSpamBase', () => {
    it('should call initSpamFile if path does not exist', async () => {
      fileSystem.pathExists.mockResolvedValue(false);
      const initSpamFileSpy = jest.spyOn(service as any, 'initSpamFile').mockResolvedValue(undefined);
      const readSpamFileSpy = jest.spyOn(service as any, 'readSpamFile').mockResolvedValue(undefined);

      await service.activateSpamBase();

      expect(fileSystem.pathExists).toHaveBeenCalledWith([SETTINGS_DIR, SPAM_FILE_NAME]);
      expect(initSpamFileSpy).toHaveBeenCalled();
      expect(readSpamFileSpy).toHaveBeenCalled();
    });

    it('should not call initSpamFile if path exists', async () => {
      fileSystem.pathExists.mockResolvedValue(true);
      const initSpamFileSpy = jest.spyOn(service as any, 'initSpamFile').mockResolvedValue(undefined);
      const readSpamFileSpy = jest.spyOn(service as any, 'readSpamFile').mockResolvedValue(undefined);

      await service.activateSpamBase();

      expect(fileSystem.pathExists).toHaveBeenCalledWith([SETTINGS_DIR, SPAM_FILE_NAME]);
      expect(initSpamFileSpy).not.toHaveBeenCalled();
      expect(readSpamFileSpy).toHaveBeenCalled();
    });
  });

  describe('readSpamFile', () => {
    it('should read spam file, split it and set spam expressions', async () => {
      const fileContent = 'abc\r\ndef\r\n\r\nghi';
      fileSystem.readTextFile.mockResolvedValue(fileContent);

      await service['readSpamFile']();

      expect(fileSystem.readTextFile).toHaveBeenCalledWith([SETTINGS_DIR, SPAM_FILE_NAME]);
      expect(siteContext.setSpamExpressions).toHaveBeenCalledWith(['abc', 'def', 'ghi']);
    });

    it('should handle empty lines', async () => {
      const fileContent = 'one\r\n\r\n\r\nthree\r\n';
      fileSystem.readTextFile.mockResolvedValue(fileContent);

      await service['readSpamFile']();

      expect(siteContext.setSpamExpressions).toHaveBeenCalledWith(['one', 'three']);
    });
  });

  describe('initSpamFile', () => {
    it('should read preset file, reformat and write spam file', async () => {
      const presetContent = 'a\nb\nc\n';
      fileSystem.readTextFileOutOfVolume.mockResolvedValue(presetContent);

      await service['initSpamFile']();

      expect(fileSystem.readTextFileOutOfVolume).toHaveBeenCalledWith(`${PRESETS}${path.sep}${SPAM_FILE_NAME}`);
      expect(fileSystem.writeTextFile).toHaveBeenCalledWith([SETTINGS_DIR, SPAM_FILE_NAME], 'a\r\nb\r\nc');
    });

    it('should ignore empty lines in preset', async () => {
      const presetContent = 'x\n\ny\n\nz\n';
      fileSystem.readTextFileOutOfVolume.mockResolvedValue(presetContent);

      await service['initSpamFile']();

      expect(fileSystem.writeTextFile).toHaveBeenCalledWith([SETTINGS_DIR, SPAM_FILE_NAME], 'x\r\ny\r\nz');
    });
  });
});
