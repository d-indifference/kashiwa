import { IpFilterGuard } from './ip-filter.guard';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';

// Моки для зависимостей
const fileSystemMock = {
  pathExists: jest.fn(),
  writeTextFile: jest.fn(),
  readTextFile: jest.fn()
};
const ipBlacklistProviderMock = {
  isIpBlocked: jest.fn(),
  reloadBlacklist: jest.fn()
};
const siteContextMock = {
  setIpBlackList: jest.fn()
};

// Мок для getClientIp
jest.mock('@supercharge/request-ip', () => ({
  getClientIp: jest.fn()
}));
import { getClientIp } from '@supercharge/request-ip';

// Мок констант и LOCALE
const Constants = {
  SETTINGS_DIR: '_settings',
  BLACK_LIST_FILE_NAME: 'black_list'
};
const LOCALE = {
  UNABLE_TO_DETERMINATE_IP: 'Unable to determine IP'
};

describe('IpFilterGuard', () => {
  let guard: IpFilterGuard;

  beforeEach(() => {
    guard = new IpFilterGuard(fileSystemMock as any, ipBlacklistProviderMock as any, siteContextMock as any);
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    const createContextWithRequest = (req: any) => {
      return {
        switchToHttp: () => ({
          getRequest: () => req
        })
      } as unknown as ExecutionContext;
    };

    it('should throw ForbiddenException if clientIp is not defined', () => {
      (getClientIp as jest.Mock).mockReturnValue(undefined);

      const context = createContextWithRequest({});
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should return true if IP is not blocked', () => {
      (getClientIp as jest.Mock).mockReturnValue('1.2.3.4');
      ipBlacklistProviderMock.isIpBlocked.mockReturnValue(false);

      const context = createContextWithRequest({});
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false if IP is blocked', () => {
      (getClientIp as jest.Mock).mockReturnValue('1.2.3.4');
      ipBlacklistProviderMock.isIpBlocked.mockReturnValue(true);

      const context = createContextWithRequest({});
      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('load', () => {
    it('should create blacklist file if not exists and set blacklist', async () => {
      fileSystemMock.pathExists.mockResolvedValue(false);
      fileSystemMock.writeTextFile.mockResolvedValue(undefined);
      fileSystemMock.readTextFile.mockResolvedValue('127.0.0.1\r\n192.168.0.1\r\n');
      siteContextMock.setIpBlackList.mockReturnValue(undefined);

      await guard.load();

      expect(fileSystemMock.pathExists).toHaveBeenCalledWith([Constants.SETTINGS_DIR, Constants.BLACK_LIST_FILE_NAME]);
      expect(fileSystemMock.writeTextFile).toHaveBeenCalledWith(
        [Constants.SETTINGS_DIR, Constants.BLACK_LIST_FILE_NAME],
        '\r\n'
      );
      expect(fileSystemMock.readTextFile).toHaveBeenCalledWith([
        Constants.SETTINGS_DIR,
        Constants.BLACK_LIST_FILE_NAME
      ]);
      expect(siteContextMock.setIpBlackList).toHaveBeenCalledWith(['127.0.0.1', '192.168.0.1']);
      expect(ipBlacklistProviderMock.reloadBlacklist).toHaveBeenCalled();
    });

    it('should not create blacklist file if it exists', async () => {
      fileSystemMock.pathExists.mockResolvedValue(true);
      fileSystemMock.readTextFile.mockResolvedValue('127.0.0.1\r\n');
      siteContextMock.setIpBlackList.mockReturnValue(undefined);

      await guard.load();

      expect(fileSystemMock.writeTextFile).not.toHaveBeenCalled();
      expect(fileSystemMock.readTextFile).toHaveBeenCalledWith([
        Constants.SETTINGS_DIR,
        Constants.BLACK_LIST_FILE_NAME
      ]);
      expect(siteContextMock.setIpBlackList).toHaveBeenCalledWith(['127.0.0.1']);
      expect(ipBlacklistProviderMock.reloadBlacklist).toHaveBeenCalled();
    });

    it('should handle empty blacklist file', async () => {
      fileSystemMock.pathExists.mockResolvedValue(true);
      fileSystemMock.readTextFile.mockResolvedValue('\r\n');
      siteContextMock.setIpBlackList.mockReturnValue(undefined);

      await guard.load();

      expect(siteContextMock.setIpBlackList).toHaveBeenCalledWith([]);
      expect(ipBlacklistProviderMock.reloadBlacklist).toHaveBeenCalled();
    });
  });
});
