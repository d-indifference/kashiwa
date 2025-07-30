/* eslint-disable @typescript-eslint/ban-ts-comment */
import { SiteContextProvider } from './site-context.provider';
import { InternalServerErrorException } from '@nestjs/common';

const LOCALE = {
  GLOBAL_SETTINGS_NOT_FOUND: 'Global settings not found'
};

describe('SiteContextProvider', () => {
  let provider: SiteContextProvider;
  let cacheMock: {
    get: jest.Mock;
    set: jest.Mock;
  };

  beforeEach(() => {
    cacheMock = {
      get: jest.fn(),
      set: jest.fn()
    };
    provider = new SiteContextProvider(cacheMock as any);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('getGlobalSettings', () => {
    it('should return global settings if present', () => {
      const settings = { foo: 'bar' };
      cacheMock.get.mockReturnValueOnce(settings);
      expect(provider.getGlobalSettings()).toBe(settings);
      expect(cacheMock.get).toHaveBeenCalledWith('KEY_GLOBAL_SETTINGS');
    });

    it('should throw if global settings are missing', () => {
      cacheMock.get.mockReturnValueOnce(undefined);
      expect(() => provider.getGlobalSettings()).toThrow(InternalServerErrorException);
    });
  });

  describe('setGlobalSettings', () => {
    it('should set global settings in cache', () => {
      const settings = { baz: 1234 };
      provider.setGlobalSettings(settings as any);
      expect(cacheMock.set).toHaveBeenCalledWith('KEY_GLOBAL_SETTINGS', settings);
    });
  });

  describe('getSpamExpressions', () => {
    it('should return spam expressions from cache', () => {
      const spamList = ['spam', 'badword'];
      cacheMock.get.mockReturnValueOnce(spamList);
      expect(provider.getSpamExpressions()).toBe(spamList);
      expect(cacheMock.get).toHaveBeenCalledWith('KEY_SPAM_EXPRESSIONS');
    });

    it('should return undefined if not set', () => {
      cacheMock.get.mockReturnValueOnce(undefined);
      expect(provider.getSpamExpressions()).toBeUndefined();
    });
  });

  describe('setSpamExpressions', () => {
    it('should set spam expressions in cache', () => {
      const spamList = ['foo', 'bar'];
      provider.setSpamExpressions(spamList);
      expect(cacheMock.set).toHaveBeenCalledWith('KEY_SPAM_EXPRESSIONS', spamList);
    });
  });

  describe('getIpBlackList', () => {
    it('should return IP blacklist from cache', () => {
      const ipList = ['1.2.3.4', '5.6.7.8'];
      cacheMock.get.mockReturnValueOnce(ipList);
      expect(provider.getIpBlackList()).toBe(ipList);
      expect(cacheMock.get).toHaveBeenCalledWith('KEY_IP_BLACK_LIST');
    });

    it('should return undefined if not set', () => {
      cacheMock.get.mockReturnValueOnce(undefined);
      expect(provider.getIpBlackList()).toBeUndefined();
    });
  });

  describe('setIpBlackList', () => {
    it('should set IP blacklist in cache', () => {
      const ipList = ['8.8.8.8'];
      provider.setIpBlackList(ipList);
      expect(cacheMock.set).toHaveBeenCalledWith('KEY_IP_BLACK_LIST', ipList);
    });
  });

  describe('private get()', () => {
    it('should throw if value is not found', () => {
      cacheMock.get.mockReturnValueOnce(undefined);
      // @ts-ignore
      expect(() => provider['get']('SOME_KEY', 'GLOBAL_SETTINGS_NOT_FOUND')).toThrow(InternalServerErrorException);
    });

    it('should return value if found', () => {
      cacheMock.get.mockReturnValueOnce('value');
      // @ts-ignore
      expect(provider['get']('SOME_KEY', 'GLOBAL_SETTINGS_NOT_FOUND')).toBe('value');
    });
  });
});
