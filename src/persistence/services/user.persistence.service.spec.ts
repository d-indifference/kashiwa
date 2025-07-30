/* eslint-disable @typescript-eslint/no-require-imports */

import { UserPersistenceService } from './user.persistence.service';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';

const prismaMock = {
  user: {
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};
const userMapperMock = {
  toDto: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};
const loggerMock = {
  setContext: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
};

jest.mock('@locale/locale', () => ({
  LOCALE
}));

const LOCALE = {
  USER_WITH_ID_NOT_FOUND: (id: string) => `User with id ${id} not found`,
  USER_ALREADY_EXISTS: (username: string) => `User "${username}" already exists`,
  WRONG_USERNAME_OR_PASSWORD: 'Wrong username or password'
};

jest.mock('@locale/locale', () => ({
  LOCALE: {
    USER_WITH_ID_NOT_FOUND: (id: string) => `User with id ${id} not found`,
    USER_ALREADY_EXISTS: (username: string) => `User "${username}" already exists`,
    WRONG_USERNAME_OR_PASSWORD: 'Wrong username or password'
  },
  V_LOCALE: {
    V_NUMBER: (value: string) => `Value is not a number: ${value}`
  },
  vStr: jest.fn()
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn()
}));
import * as bcrypt from 'bcrypt';

describe('UserPersistenceService', () => {
  let service: UserPersistenceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserPersistenceService(prismaMock as any, userMapperMock as any, loggerMock as any);
  });

  it('should be defined and set logger context', () => {
    expect(service).toBeDefined();
    expect(loggerMock.setContext).toHaveBeenCalledWith('UserPersistenceService');
  });

  describe('findAll', () => {
    it('should return page of user DTOs', async () => {
      const pageInstance = {
        content: [{}, {}],
        current: 1,
        total: 1,
        previous: null,
        next: null,
        map: jest.fn(function (mapper) {
          return {
            content: this.content.map(mapper),
            current: this.current,
            total: this.total,
            previous: this.previous,
            next: this.next
          };
        })
      };
      userMapperMock.toDto.mockImplementation(u => ({ user: u }));
      jest.spyOn(require('@persistence/lib/page').Page, 'of').mockResolvedValueOnce(pageInstance);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.content).toEqual([{ user: {} }, { user: {} }]);
    });
  });

  describe('findById', () => {
    it('should throw if user not found', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      await expect(service.findById('uid')).rejects.toThrow(NotFoundException);
    });
    it('should return mapped dto if found', async () => {
      const user = { id: 'uid', username: 'test' };
      prismaMock.user.findFirst.mockResolvedValueOnce(user);
      userMapperMock.toDto.mockReturnValueOnce({ id: 'uid', username: 'test' });
      expect(await service.findById('uid')).toEqual({ id: 'uid', username: 'test' });
    });
  });

  describe('countAll', () => {
    it('should return user count', async () => {
      prismaMock.user.count.mockResolvedValueOnce(42);
      expect(await service.countAll()).toBe(42);
    });
  });

  describe('findByIdStrict', () => {
    it('should return user if found', async () => {
      const user = { id: 'uid' };
      prismaMock.user.findFirst.mockResolvedValueOnce(user);
      expect(await service.findByIdStrict('uid')).toEqual({ id: 'uid' });
    });
    it('should return null if not found', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      expect(await service.findByIdStrict('uid')).toBeNull();
    });
  });

  describe('create', () => {
    it('should check unique, create user and return dto', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      userMapperMock.create.mockResolvedValueOnce({ username: 'test' });
      const createdUser = { id: 'uid', username: 'test' };
      prismaMock.user.create.mockResolvedValueOnce(createdUser);
      userMapperMock.toDto.mockReturnValueOnce({ id: 'uid', username: 'test' });

      const dto = { username: 'test', password: 'pass' };
      const result = await service.create(dto as any);

      expect(loggerMock.info).toHaveBeenCalledWith(dto, 'create');
      expect(prismaMock.user.create).toHaveBeenCalledWith({ data: { username: 'test' } });
      expect(result).toEqual({ id: 'uid', username: 'test' });
    });

    it('should throw if username not unique', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'exists' });
      const dto = { username: 'test', password: 'pass' };
      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
      expect(loggerMock.warn).toHaveBeenCalledWith('User "test" already exists');
    });
  });

  describe('update', () => {
    it('should check user on update, update and return dto', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'uid' });
      prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'uid' });
      userMapperMock.update.mockResolvedValueOnce({ username: 'new' });
      const updatedUser = { id: 'uid', username: 'new' };
      prismaMock.user.update.mockResolvedValueOnce(updatedUser);
      userMapperMock.toDto.mockReturnValueOnce({ id: 'uid', username: 'new' });

      const dto = { id: 'uid', username: 'new', password: 'pass' };
      const result = await service.update(dto as any);

      expect(loggerMock.info).toHaveBeenCalledWith(dto, 'update');
      expect(prismaMock.user.update).toHaveBeenCalledWith({ where: { id: 'uid' }, data: { username: 'new' } });
      expect(result).toEqual({ id: 'uid', username: 'new' });
    });

    it('should throw if user not found on update', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      const dto = { id: 'uid', username: 'new', password: 'pass' };
      await expect(service.update(dto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw if username taken by another user on update', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'uid' });
      prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'other' });
      const dto = { id: 'uid', username: 'new', password: 'pass' };
      await expect(service.update(dto as any)).rejects.toThrow(BadRequestException);
      expect(loggerMock.warn).toHaveBeenCalledWith('User "new" already exists');
    });
  });

  describe('remove', () => {
    it('should delete user and log', async () => {
      prismaMock.user.delete.mockResolvedValueOnce({ id: 'uid' });
      await service.remove('uid');
      expect(loggerMock.info).toHaveBeenCalledWith({ id: 'uid' }, 'remove');
      expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 'uid' } });
      expect(loggerMock.info).toHaveBeenCalledWith({ id: 'uid' }, '[SUCCESS] remove');
    });
  });

  describe('signIn', () => {
    it('should throw if user not found', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      await expect(service.signIn('name', 'pass')).rejects.toThrow(UnauthorizedException);
      expect(loggerMock.warn).toHaveBeenCalledWith({ username: 'name' }, '[UNAUTHORIZED]');
    });

    it('should throw if password does not match', async () => {
      const user = { id: 'uid', username: 'name', passwordHash: 'hashed' };
      prismaMock.user.findFirst.mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      await expect(service.signIn('name', 'pass')).rejects.toThrow(UnauthorizedException);
      expect(loggerMock.warn).toHaveBeenCalledWith({ username: 'name' }, '[UNAUTHORIZED]');
    });

    it('should return user if credentials are valid', async () => {
      const user = { id: 'uid', username: 'name', passwordHash: 'hashed' };
      prismaMock.user.findFirst.mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      const result = await service.signIn('name', 'pass');
      expect(result).toEqual(user);
    });
  });

  describe('checkUniqueUserOnCreate', () => {
    it('should throw if user exists', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'exists' });
      const dto = { username: 'test', password: 'pass' };
      await expect(service['checkUniqueUserOnCreate'](dto as any)).rejects.toThrow(BadRequestException);
      expect(loggerMock.warn).toHaveBeenCalledWith('User "test" already exists');
    });

    it('should resolve if user does not exist', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      const dto = { username: 'test', password: 'pass' };
      await expect(service['checkUniqueUserOnCreate'](dto as any)).resolves.toBeUndefined();
    });
  });

  describe('checkUserOnUpdate', () => {
    it('should throw if user not found', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      const dto = { id: 'uid', username: 'name', password: 'pass' };
      await expect(service['checkUserOnUpdate'](dto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw if username taken by another user', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'uid' });
      prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'other' });
      const dto = { id: 'uid', username: 'name', password: 'pass' };
      await expect(service['checkUserOnUpdate'](dto as any)).rejects.toThrow(BadRequestException);
      expect(loggerMock.warn).toHaveBeenCalledWith('User "name" already exists');
    });

    it('should resolve if username is not taken or taken by same user', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'uid' });
      prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'uid' });
      const dto = { id: 'uid', username: 'name', password: 'pass' };
      await expect(service['checkUserOnUpdate'](dto as any)).resolves.toBeUndefined();
    });
  });
});
