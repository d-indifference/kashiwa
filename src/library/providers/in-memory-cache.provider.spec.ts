/* eslint-disable @typescript-eslint/ban-ts-comment */
import { InMemoryCacheProvider } from './in-memory-cache.provider';
import * as NodeCache from 'node-cache';

jest.mock('node-cache');

describe('InMemoryCacheProvider', () => {
  let provider: InMemoryCacheProvider;
  let cacheMock: jest.Mocked<NodeCache>;

  beforeEach(() => {
    // @ts-ignore
    cacheMock = new NodeCache() as jest.Mocked<NodeCache>;
    (NodeCache as unknown as jest.Mock).mockImplementation(() => cacheMock);
    provider = new InMemoryCacheProvider();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should call cache.get on get()', () => {
    cacheMock.get.mockReturnValueOnce('value');
    const result = provider.get<string>('key');
    expect(cacheMock.get).toHaveBeenCalledWith('key');
    expect(result).toBe('value');
  });

  it('should call cache.set on set()', () => {
    provider.set('key', 'value');
    expect(cacheMock.set).toHaveBeenCalledWith('key', 'value');
  });

  it('should call cache.del on del()', () => {
    provider.del('key');
    expect(cacheMock.del).toHaveBeenCalledWith('key');
  });

  it('should call cache.flushAll on flush()', () => {
    provider.flush();
    expect(cacheMock.flushAll).toHaveBeenCalled();
  });
});
