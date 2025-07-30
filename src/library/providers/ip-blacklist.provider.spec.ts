import { IpBlacklistProvider } from './ip-blacklist.provider';

describe('IpBlacklistProvider', () => {
  let siteContextMock: any;
  let provider: IpBlacklistProvider;

  beforeEach(() => {
    siteContextMock = {
      getIpBlackList: jest.fn()
    };
    provider = new IpBlacklistProvider(siteContextMock);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('isIpBlocked', () => {
    it('should return false for invalid IP', () => {
      expect(provider.isIpBlocked('not-an-ip')).toBe(false);
    });

    it('should block IPv4 from blacklist', () => {
      siteContextMock.getIpBlackList.mockReturnValue(['192.168.1.1']);
      provider.reloadBlacklist();
      expect(provider.isIpBlocked('192.168.1.1')).toBe(true);
      expect(provider.isIpBlocked('192.168.1.2')).toBe(false);
    });

    it('should block IPv4 with wildcard', () => {
      siteContextMock.getIpBlackList.mockReturnValue(['192.168.1.*']);
      provider.reloadBlacklist();
      expect(provider.isIpBlocked('192.168.1.10')).toBe(true);
      expect(provider.isIpBlocked('192.168.2.10')).toBe(false);
    });

    it('should block IPv6 from blacklist', () => {
      siteContextMock.getIpBlackList.mockReturnValue(['abcd:1234:5678:9abc:0:0:0:1']);
      provider.reloadBlacklist();
      expect(provider.isIpBlocked('abcd:1234:5678:9abc:0:0:0:1')).toBe(true);
      expect(provider.isIpBlocked('abcd:1234:5678:9abc:0:0:0:2')).toBe(false);
    });

    it('should block IPv6 with wildcard', () => {
      siteContextMock.getIpBlackList.mockReturnValue(['abcd:1234:5678:*:*:*:*:*']);
      provider.reloadBlacklist();
      expect(provider.isIpBlocked('abcd:1234:5678:0000:0000:0000:0000:0001')).toBe(true);
      expect(provider.isIpBlocked('abcd:1234:5678:ffff:ffff:ffff:ffff:ffff')).toBe(true);
      expect(provider.isIpBlocked('abcd:1234:5677:0000:0000:0000:0000:0001')).toBe(false);
    });
  });

  describe('reloadBlacklist', () => {
    it('should rebuild trie after reload', () => {
      siteContextMock.getIpBlackList.mockReturnValue(['10.0.0.1']);
      provider.reloadBlacklist();
      expect(provider.isIpBlocked('10.0.0.1')).toBe(true);

      siteContextMock.getIpBlackList.mockReturnValue(['10.0.0.2']);
      provider.reloadBlacklist();
      expect(provider.isIpBlocked('10.0.0.2')).toBe(true);
      expect(provider.isIpBlocked('10.0.0.1')).toBe(false);
    });
  });

  describe('private helpers', () => {
    it('should throw error for invalid IPv4 pattern in patternToBinary', () => {
      expect(() => (provider as any).patternToBinary('bad.ip')).toThrow();
    });

    it('should throw error for invalid IPv4 part in ipv4ToBinary', () => {
      expect(() => (provider as any).ipv4ToBinary('256.0.0.1')).toThrow();
    });
  });
});
