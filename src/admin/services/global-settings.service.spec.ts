import { GlobalSettingsService } from './global-settings.service';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { GlobalSettingsForm } from '@admin/forms';
import { ISession } from '@admin/interfaces';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { Params } from 'nestjs-pino/params';

describe('GlobalSettingsService', () => {
  let service: GlobalSettingsService;
  let fileSystem: jest.Mocked<FileSystemProvider>;
  let siteContext: jest.Mocked<SiteContextProvider>;
  let mockSession: any;
  let mockRes: any;

  beforeEach(() => {
    fileSystem = {
      writeTextFile: jest.fn().mockResolvedValue(undefined)
    } as any;
    siteContext = {
      getGlobalSettings: jest.fn(),
      setGlobalSettings: jest.fn()
    } as any;
    service = new GlobalSettingsService(fileSystem, siteContext, new PinoLogger({} as Params));
    mockSession = { user: { id: '1' } };
    mockRes = { redirect: jest.fn() };
  });

  describe('getGlobalSettings', () => {
    it('should return RenderableSessionFormPage with form and options', () => {
      const globalSettings = new GlobalSettingsForm();
      globalSettings.siteName = 'Kashiwa Image Board';
      siteContext.getGlobalSettings.mockReturnValue(globalSettings);
      jest.spyOn(GlobalSettingsForm, 'fromNonDecoratedForm').mockReturnValue(globalSettings);

      const result = service.getGlobalSettings(mockSession as ISession);

      expect(siteContext.getGlobalSettings).toHaveBeenCalled();
      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('commons');
      expect(result).toHaveProperty('form');
    });
  });

  describe('saveGlobalSettings', () => {
    it('should set global settings, overwrite file and redirect', async () => {
      const form = { siteName: 'Kashiwa Image Board' } as GlobalSettingsForm;
      jest.spyOn(service as any, 'overwriteSettingsFile').mockResolvedValue(undefined);

      await service.saveGlobalSettings(form, mockRes as Response);

      expect(siteContext.setGlobalSettings).toHaveBeenCalledWith(form);
      expect((service as any).overwriteSettingsFile).toHaveBeenCalledWith(form);
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/global-settings');
    });
  });

  describe('overwriteSettingsFile', () => {
    it('should write settings to file', async () => {
      const form = { siteName: 'Kashiwa Image Board' } as GlobalSettingsForm;
      await (service as any).overwriteSettingsFile(form);
      expect(fileSystem.writeTextFile).toHaveBeenCalled();
      const [path, content] = fileSystem.writeTextFile.mock.calls[0];
      expect(Array.isArray(path)).toBe(true);
      expect(typeof content).toBe('string');
      expect(content).toContain('"siteName":"Kashiwa Image Board"');
    });
  });
});
