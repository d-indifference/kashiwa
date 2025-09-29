import { SpamListService } from './spam-list.service';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { AntiSpamService } from '@restriction/modules/antispam/services';
import { SpamListForm } from '@admin/forms';
import { Cookie } from 'express-session';
import { UserRole } from '@prisma/client';
import { ISession } from '@admin/interfaces';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { Params } from 'nestjs-pino/params';

describe('SpamListService', () => {
  let service: SpamListService;
  let fileSystem: jest.Mocked<FileSystemProvider>;
  let siteContext: jest.Mocked<SiteContextProvider>;
  let antiSpamService: jest.Mocked<AntiSpamService>;
  let mockSession: any;
  let mockRes: any;

  beforeEach(() => {
    fileSystem = {
      readTextFile: jest.fn(),
      writeTextFile: jest.fn().mockResolvedValue(undefined)
    } as any;
    siteContext = {
      setSpamExpressions: jest.fn()
    } as any;
    antiSpamService = {
      compileSpamRegexes: jest.fn()
    } as any;
    service = new SpamListService(fileSystem, siteContext, antiSpamService, new PinoLogger({} as Params));
    mockSession = { cookie: {} as Cookie, payload: { id: '1', role: UserRole.ADMINISTRATOR } };
    mockRes = { redirect: jest.fn() };
  });

  describe('renderFormContent', () => {
    it('should return RenderableSessionFormPage with spam list', async () => {
      fileSystem.readTextFile.mockResolvedValue('spam1\r\nspam2');
      const result = await service.renderFormContent(mockSession as ISession);
      expect(fileSystem.readTextFile).toHaveBeenCalled();
      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('commons');
      expect(result).toHaveProperty('form');
    });
  });

  describe('saveSpamList', () => {
    it('should set spam expressions, overwrite file, compile regexes and redirect', async () => {
      const form = { spamList: 'spam1\r\nspam2' } as any;
      jest.spyOn(service as any, 'overwriteSpamList').mockResolvedValue(undefined);

      await service.saveSpamList(form as SpamListForm, mockRes as Response);

      expect(siteContext.setSpamExpressions).toHaveBeenCalledWith(['spam1', 'spam2']);
      expect((service as any).overwriteSpamList).toHaveBeenCalledWith(form);
      expect(antiSpamService.compileSpamRegexes).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/spam');
    });
  });

  describe('readSpamList', () => {
    it('should read spam list file', async () => {
      fileSystem.readTextFile.mockResolvedValue('spam1');
      const result = await (service as any).readSpamList();
      expect(fileSystem.readTextFile).toHaveBeenCalled();
      expect(result).toBe('spam1');
    });
  });

  describe('overwriteSpamList', () => {
    it('should write spam list to file', async () => {
      const form = { spamList: 'spam1' } as any;
      await (service as any).overwriteSpamList(form);
      expect(fileSystem.writeTextFile).toHaveBeenCalled();
      const [path, content] = fileSystem.writeTextFile.mock.calls[0];
      expect(Array.isArray(path)).toBe(true);
      expect(content).toBe('spam1');
    });
  });
});
