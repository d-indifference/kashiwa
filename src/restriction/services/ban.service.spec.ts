import { BanService } from './ban.service';
import { ForbiddenException } from '@nestjs/common';
import { BanDto } from '@persistence/dto/ban';
import { DateTime } from 'luxon';
import { LOCALE } from '@locale/locale';

describe('BanService', () => {
  let banPersistenceService: any;
  let service: BanService;

  beforeAll(() => {
    (global as any).LOCALE = LOCALE;
  });

  beforeEach(() => {
    banPersistenceService = {
      getCurrentBan: jest.fn()
    };
    service = new BanService(banPersistenceService);
    jest.clearAllMocks();
  });

  describe('checkBan', () => {
    it('should do nothing for admin users', async () => {
      await expect(service.checkBan('127.0.0.1', true, 'board')).resolves.toBeUndefined();
      expect(banPersistenceService.getCurrentBan).not.toHaveBeenCalled();
    });

    it('should do nothing if no ban found', async () => {
      banPersistenceService.getCurrentBan.mockResolvedValue(null);
      await expect(service.checkBan('127.0.0.1', false, 'board')).resolves.toBeUndefined();
      expect(banPersistenceService.getCurrentBan).toHaveBeenCalledWith('127.0.0.1');
    });

    it('should throw ForbiddenException if ban exists and boardUrl matches', async () => {
      const banDto = {
        till: DateTime.now().plus({ days: 3 }).toJSDate(),
        reason: 'spam',
        boardUrl: 'board'
      };
      banPersistenceService.getCurrentBan.mockResolvedValue(banDto);

      await expect(service.checkBan('127.0.0.1', false, 'board')).rejects.toThrow(ForbiddenException);
      try {
        await service.checkBan('127.0.0.1', false, 'board');
      } catch (e) {
        expect(e.message.startsWith('You have been banned until')).toBeTruthy();
      }
    });

    it('should throw ForbiddenException if ban exists and boardUrl is empty', async () => {
      const banDto = {
        till: DateTime.now().plus({ days: 3 }).toJSDate(),
        reason: 'multi-board ban',
        boardUrl: ''
      };
      banPersistenceService.getCurrentBan.mockResolvedValue(banDto);

      await expect(service.checkBan('127.0.0.1', false, 'other')).rejects.toThrow(ForbiddenException);
      try {
        await service.checkBan('127.0.0.1', false, 'other');
      } catch (e) {
        expect(e.message.startsWith('You have been banned until')).toBeTruthy();
      }
    });

    it('should not throw if ban exists but for another board', async () => {
      const banDto = {
        till: new Date('2025-08-01'),
        reason: 'off-topic',
        boardUrl: 'another'
      };
      banPersistenceService.getCurrentBan.mockResolvedValue(banDto);

      await expect(service.checkBan('127.0.0.1', false, 'board')).resolves.toBeUndefined();
    });
  });

  describe('makeBanMessage', () => {
    it('should return correct ban message', () => {
      const banDto = {
        till: new Date('2026-01-01'),
        reason: 'rule violation',
        boardUrl: 'b'
      } as BanDto;
      const message = service['makeBanMessage'](banDto);
      expect(message.startsWith('You have been banned until')).toBeTruthy();
    });
  });
});
