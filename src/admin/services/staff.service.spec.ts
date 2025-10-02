import { StaffService } from './staff.service';
import { UserPersistenceService } from '@persistence/services';
import { TablePage } from '@admin/pages';
import { StaffUpdateForm, StaffUpdateMyselfForm } from '@admin/forms/staff';
import { UserCreateDto, UserDto, UserUpdateDto } from '@persistence/dto/user';
import { Page, PageRequest } from '@persistence/lib/page';
import { Cookie } from 'express-session';
import { UserRole } from '@prisma/client';
import { ISession } from '@admin/interfaces';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { Params } from 'nestjs-pino/params';

describe('StaffService', () => {
  let service: StaffService;
  let userPersistenceService: jest.Mocked<UserPersistenceService>;
  let mockSession: any;
  let mockRes: any;

  beforeEach(() => {
    userPersistenceService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn()
    } as any;
    service = new StaffService(userPersistenceService, new PinoLogger({} as Params));
    mockSession = { cookie: {} as Cookie, payload: { id: '1', role: UserRole.ADMINISTRATOR } };
    mockRes = { redirect: jest.fn() };
  });

  describe('getList', () => {
    it('should return TablePage with users', async () => {
      userPersistenceService.findAll.mockResolvedValue({ content: [], total: 0 } as unknown as Page<UserDto>);
      const pageRequest: PageRequest = { page: 1, limit: 10 };
      const result = await service.getList(pageRequest, mockSession as ISession);
      expect(result).toBeInstanceOf(TablePage);
      expect(userPersistenceService.findAll).toHaveBeenCalledWith(pageRequest);
    });
  });

  describe('getMyProfileForm', () => {
    it('should return RenderableSessionFormPage for current user', async () => {
      userPersistenceService.findById.mockResolvedValue({ username: 'admin', email: 'a@a.a' } as UserDto);
      const result = await service.getMyProfileForm(mockSession as ISession);
      expect(userPersistenceService.findById).toHaveBeenCalledWith('1');
      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('form');
      expect(result).toHaveProperty('commons');
    });
  });

  describe('getForUpdate', () => {
    it('should return RenderableSessionFormPage for user by id', async () => {
      userPersistenceService.findById.mockResolvedValue({
        id: 'user2',
        username: 'mod',
        email: 'm@m.m',
        role: UserRole.MODERATOR
      });
      const result = await service.getForUpdate(mockSession as ISession, 'user2');
      expect(userPersistenceService.findById).toHaveBeenCalledWith('user2');
      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('form');
      expect(result).toHaveProperty('commons');
    });
  });

  describe('create', () => {
    it('should create user and redirect', async () => {
      const form = { username: 'mod', email: 'm@m.m', password: 'pass', role: UserRole.MODERATOR } as UserCreateDto;
      userPersistenceService.create.mockResolvedValue({ id: 'user2' } as UserDto);
      await service.create(form, mockRes as Response);
      expect(userPersistenceService.create).toHaveBeenCalledWith(expect.any(UserCreateDto));
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/staff/edit/user2');
    });
  });

  describe('update', () => {
    it('should update user (StaffUpdateForm) and redirect', async () => {
      const form = { id: 'user2', username: 'mod', email: 'm@m.m', password: 'pass', role: UserRole.MODERATOR } as any;
      userPersistenceService.update.mockResolvedValue({ id: 'user2' } as UserDto);
      await service.update(
        form as StaffUpdateForm,
        mockRes as Response,
        '/kashiwa/staff/edit/user2',
        mockSession as ISession
      );
      expect(userPersistenceService.update).toHaveBeenCalledWith(expect.any(UserUpdateDto));
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/staff/edit/user2');
    });

    it('should update user (StaffUpdateMyselfForm) and redirect', async () => {
      const form = { username: 'me', email: 'me@me.me', password: 'pass' } as any;
      userPersistenceService.update.mockResolvedValue({ id: '1' } as UserDto);
      await service.update(
        form as StaffUpdateMyselfForm,
        mockRes as Response,
        '/kashiwa/staff/my',
        mockSession as ISession
      );
      expect(userPersistenceService.update).toHaveBeenCalledWith(expect.any(UserUpdateDto));
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/staff/my');
    });
  });

  describe('remove', () => {
    it('should remove user and redirect', async () => {
      userPersistenceService.remove.mockResolvedValue(undefined);
      await service.remove('user2', mockRes as Response);
      expect(userPersistenceService.remove).toHaveBeenCalledWith('user2');
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/staff');
    });
  });
});
