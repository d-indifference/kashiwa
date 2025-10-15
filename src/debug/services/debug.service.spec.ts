import { DebugService } from './debug.service';
import { InMemoryCacheProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { ForbiddenException } from '@nestjs/common';

describe('DebugService', () => {
  let service: DebugService;
  let cacheProviderMock: jest.Mocked<InMemoryCacheProvider>;
  let loggerMock: jest.Mocked<PinoLogger>;

  beforeEach(() => {
    cacheProviderMock = {
      dumpCache: jest.fn()
    } as any;

    loggerMock = {
      setContext: jest.fn(),
      debug: jest.fn()
    } as any;

    service = new DebugService(cacheProviderMock, loggerMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('dumpInMemoryCache', () => {
    it('should log and return cache data when dumpCache succeeds', () => {
      const fakeCache = { key1: 'value1' };
      cacheProviderMock.dumpCache.mockReturnValue(fakeCache);

      const result = service.dumpInMemoryCache();

      expect(loggerMock.setContext).toHaveBeenCalledWith('DebugService');
      expect(loggerMock.debug).toHaveBeenCalledWith('dumpInMemoryCache');
      expect(cacheProviderMock.dumpCache).toHaveBeenCalled();
      expect(loggerMock.debug).toHaveBeenCalledWith(fakeCache, 'cache dumped');
      expect(result).toEqual(fakeCache);
    });

    it('should throw ForbiddenException and log the first debug call', () => {
      cacheProviderMock.dumpCache.mockImplementation(() => {
        throw new ForbiddenException('OPERATION_ONLY_FOR_DEVELOPMENT');
      });

      expect(() => service.dumpInMemoryCache()).toThrow(ForbiddenException);
      expect(loggerMock.debug).toHaveBeenCalledWith('dumpInMemoryCache');
      expect(loggerMock.debug).not.toHaveBeenCalledWith(expect.anything(), 'cache dumped');
    });
  });
});
