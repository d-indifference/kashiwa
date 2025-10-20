import { ProtectApiProvider } from './protect-api.provider';
import { ForbiddenException } from '@nestjs/common';
import { LOCALE } from '@locale/locale';

describe('ProtectApiProvider', () => {
  let provider: ProtectApiProvider;
  let mockUserPersistenceService: { findByIdStrict: jest.Mock };
  let mockLogger: { setContext: jest.Mock; debug: jest.Mock };

  beforeEach(() => {
    mockUserPersistenceService = { findByIdStrict: jest.fn() };
    mockLogger = { setContext: jest.fn(), debug: jest.fn() };

    provider = new ProtectApiProvider(mockUserPersistenceService as any, mockLogger as any);
  });

  it('should return successfully if user exists', async () => {
    mockUserPersistenceService.findByIdStrict.mockResolvedValue({ id: '1', role: 'ADMIN' });

    await expect(provider.protect('1')).resolves.toBeUndefined();

    expect(mockUserPersistenceService.findByIdStrict).toHaveBeenCalledWith('1');
    expect(mockLogger.debug).toHaveBeenCalledWith({ userId: '1' }, 'protect');
  });

  it('should throw ForbiddenException if user does not exist', async () => {
    mockUserPersistenceService.findByIdStrict.mockResolvedValue(null);

    await expect(provider.protect('999')).rejects.toThrow(new ForbiddenException(LOCALE.NO_PERMISSION_TO_ACCESS));

    expect(mockUserPersistenceService.findByIdStrict).toHaveBeenCalledWith('999');
    expect(mockLogger.debug).toHaveBeenCalledWith({ userId: '999' }, 'protect');
  });
});
