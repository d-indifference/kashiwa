import { BanService } from './ban.service';
import { BanPersistenceService, BoardPersistenceService } from '@persistence/services';
import { TablePage } from '@admin/pages';
import { BanCreateForm } from '@admin/forms/ban';
import { BanCreateDto, BanDto } from '@persistence/dto/ban';
import { Page, PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { Cookie } from 'express-session';
import { UserRole } from '@prisma/client';
import { BoardDto } from '@persistence/dto/board';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { Params } from 'nestjs-pino/params';

describe('BanService', () => {
  let service: BanService;
  let banPersistenceService: jest.Mocked<BanPersistenceService>;
  let boardPersistenceService: jest.Mocked<BoardPersistenceService>;
  let mockSession: ISession;
  let mockRes: any;

  beforeEach(() => {
    banPersistenceService = {
      deleteOldBans: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      remove: jest.fn()
    } as any;
    boardPersistenceService = {
      findByUrl: jest.fn()
    } as any;
    service = new BanService(banPersistenceService, boardPersistenceService, new PinoLogger({} as Params));
    mockSession = { payload: { id: 'user1', role: UserRole.ADMINISTRATOR }, cookie: {} as unknown as Cookie };
    mockRes = { redirect: jest.fn() };
  });

  describe('deleteOldBans', () => {
    it('should call banPersistenceService.deleteOldBans', async () => {
      await service.deleteOldBans();
      expect(banPersistenceService.deleteOldBans).toHaveBeenCalled();
    });
  });

  describe('getBanPage', () => {
    it('should return TablePage with bans', async () => {
      const bansPage = { content: [], total: 0 } as unknown as Page<BanDto>;
      banPersistenceService.findAll.mockResolvedValue(bansPage);
      const pageRequest: PageRequest = { page: 1, limit: 10 };
      const result = await service.getBanPage(mockSession, pageRequest);
      expect(result).toBeInstanceOf(TablePage);
      expect(banPersistenceService.findAll).toHaveBeenCalledWith(pageRequest);
    });
  });

  describe('getBanForm', () => {
    it('should return a RenderableSessionFormPage', () => {
      const result = service.getBanForm(mockSession, '127.0.0.1', 'b');
      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('commons');
      expect(result).toHaveProperty('form');
    });
  });

  describe('create', () => {
    it('should create ban with board', async () => {
      const form = { ip: '1.2.3.4', timeValue: 1, timeUnit: 'd', reason: 'spam', boardUrl: 'b' } as any;
      boardPersistenceService.findByUrl.mockResolvedValue({ id: 'board1' } as BoardDto);
      banPersistenceService.create.mockResolvedValue({ id: 'ban1' } as BanDto);
      await service.create(mockSession, form as BanCreateForm, mockRes as Response);
      expect(boardPersistenceService.findByUrl).toHaveBeenCalledWith('b');
      expect(banPersistenceService.create).toHaveBeenCalledWith('user1', expect.any(BanCreateDto));
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/ban');
    });

    it('should create ban without board', async () => {
      const form = { ip: '1.2.3.4', timeValue: 1, timeUnit: 'd', reason: 'spam', boardUrl: undefined } as any;
      banPersistenceService.create.mockResolvedValue({ id: 'ban1' } as BanDto);
      await service.create(mockSession, form as BanCreateForm, mockRes as Response);
      expect(boardPersistenceService.findByUrl).not.toHaveBeenCalled();
      expect(banPersistenceService.create).toHaveBeenCalledWith('user1', expect.any(BanCreateDto));
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/ban');
    });
  });

  describe('remove', () => {
    it('should remove ban and redirect', async () => {
      banPersistenceService.remove.mockResolvedValue(undefined);
      await service.remove('ban1', mockRes as Response);
      expect(banPersistenceService.remove).toHaveBeenCalledWith('ban1');
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/ban');
    });
  });
});
