import { IpFilterService } from './ip-filter.service';
import { FileSystemProvider, IpBlacklistProvider, SiteContextProvider } from '@library/providers';
import { ISession } from '@admin/interfaces';
import { IpFilterForm } from '@admin/forms';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { Params } from 'nestjs-pino/params';

describe('IpFilterService', () => {
  let service: IpFilterService;
  let fileSystem: jest.Mocked<FileSystemProvider>;
  let ipBlacklist: jest.Mocked<IpBlacklistProvider>;
  let siteContext: jest.Mocked<SiteContextProvider>;
  let mockSession: any;
  let mockRes: any;

  beforeEach(() => {
    fileSystem = {
      readTextFile: jest.fn(),
      writeTextFile: jest.fn().mockResolvedValue(undefined)
    } as any;
    ipBlacklist = {
      reloadBlacklist: jest.fn()
    } as any;
    siteContext = {
      setIpBlackList: jest.fn()
    } as any;
    service = new IpFilterService(fileSystem, ipBlacklist, siteContext, new PinoLogger({} as Params));
    mockSession = { user: { id: '1' } };
    mockRes = { redirect: jest.fn() };
  });

  describe('renderFormContent', () => {
    it('should return RenderableSessionFormPage with blacklist', async () => {
      fileSystem.readTextFile.mockResolvedValue('127.0.0.1\r\n192.168.0.1');
      const result = await service.renderFormContent(mockSession as ISession);
      expect(fileSystem.readTextFile).toHaveBeenCalled();
      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('commons');
      expect(result).toHaveProperty('form');
    });
  });

  describe('saveIpFilter', () => {
    it('should set blacklist, overwrite file, reload and redirect', async () => {
      const form = { blackList: '127.0.0.1\r\n192.168.0.1' } as any;
      jest.spyOn(service as any, 'overwriteBlackList').mockResolvedValue(undefined);

      await service.saveIpFilter(form as IpFilterForm, mockRes as Response);

      expect(siteContext.setIpBlackList).toHaveBeenCalledWith(['127.0.0.1', '192.168.0.1']);
      expect((service as any).overwriteBlackList).toHaveBeenCalledWith(form);
      expect(ipBlacklist.reloadBlacklist).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/ip-filter');
    });
  });

  describe('readBlackList', () => {
    it('should read blacklist file', async () => {
      fileSystem.readTextFile.mockResolvedValue('127.0.0.1');
      const result = await (service as any).readBlackList();
      expect(fileSystem.readTextFile).toHaveBeenCalled();
      expect(result).toBe('127.0.0.1');
    });
  });

  describe('overwriteBlackList', () => {
    it('should write blacklist to file', async () => {
      const form = { blackList: '127.0.0.1' } as any;
      await (service as any).overwriteBlackList(form);
      expect(fileSystem.writeTextFile).toHaveBeenCalled();
      const [path, content] = fileSystem.writeTextFile.mock.calls[0];
      expect(Array.isArray(path)).toBe(true);
      expect(content).toBe('127.0.0.1');
    });
  });
});
