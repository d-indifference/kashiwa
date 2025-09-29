import { AuthService } from './auth.service';
import { UserPersistenceService } from '@persistence/services';
import { UserCreateDto, UserDto } from '@persistence/dto/user';
import { UserRole } from '@prisma/client';
import { AuthSignInForm, AuthSignUpForm } from '@admin/forms';
import { InternalServerErrorException } from '@nestjs/common';
import { ISession, ISessionPayload } from '@admin/interfaces';
import { Response, Request } from 'express';
import { Cookie } from 'express-session';
import { PinoLogger } from 'nestjs-pino';
import { Params } from 'nestjs-pino/params';

type MockExpressResponseType = { redirect: (url: string) => void };
type MockExpressRequestType = { session: { destroy: (cb: (err: unknown) => void) => void } };

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserPersistenceService>;
  let mockSession: ISession;
  let mockRes: MockExpressResponseType;
  let mockReq: MockExpressRequestType;

  beforeEach(() => {
    userService = {
      create: jest.fn(),
      signIn: jest.fn()
    } as any;
    service = new AuthService(userService, new PinoLogger({} as Params));
    mockSession = { payload: {} as ISessionPayload, cookie: {} as Cookie };
    mockRes = { redirect: jest.fn() };
    mockReq = { session: { destroy: jest.fn() } };
  });

  describe('signUp', () => {
    it('should create user and sign in', async () => {
      const form = { username: 'admin', email: 'a@a.a', password: 'pass' } as AuthSignUpForm;
      const createdUser = { id: '1', username: 'admin', role: UserRole.ADMINISTRATOR } as UserDto;
      userService.create.mockResolvedValue(createdUser);
      const signInSpy = jest.spyOn(service, 'signIn').mockResolvedValue(undefined);

      await service.signUp(form, mockSession, mockRes as Response);

      expect(userService.create).toHaveBeenCalledWith(expect.any(UserCreateDto));
      expect(signInSpy).toHaveBeenCalledWith(expect.any(AuthSignInForm), mockSession, mockRes);
    });
  });

  describe('signIn', () => {
    it('should set session payload and redirect', async () => {
      const form = { username: 'admin', password: 'pass' } as AuthSignInForm;
      const user = { id: '1', role: UserRole.ADMINISTRATOR };
      userService.signIn.mockResolvedValue(user as UserDto);

      await service.signIn(form, mockSession, mockRes as Response);

      expect(userService.signIn).toHaveBeenCalledWith('admin', 'pass');
      expect(mockSession.payload).toEqual({ id: '1', role: UserRole.ADMINISTRATOR });
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa');
    });
  });

  describe('signOut', () => {
    it('should destroy session and redirect', () => {
      mockReq.session.destroy = jest.fn(cb => cb(undefined));
      service.signOut(mockReq as Request, mockRes as Response);
      expect(mockReq.session.destroy).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/auth/sign-in');
    });

    it('should throw if destroy returns error', () => {
      mockReq.session.destroy = jest.fn(cb => cb('fail'));
      expect(() => service.signOut(mockReq as Request, mockRes as Response)).toThrow(InternalServerErrorException);
    });
  });
});
