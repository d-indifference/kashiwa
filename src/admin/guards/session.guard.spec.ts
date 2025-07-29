import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SessionGuard } from './session.guard';
import { UserPersistenceService } from '@persistence/services';
import { User } from '@prisma/client';

describe('SessionGuard', () => {
  let guard: SessionGuard;
  let reflector: Reflector;
  let userService: UserPersistenceService;

  const mockUser = { id: 1, role: 'ADMIN' };
  const mockRequest = (session: any = {}) => ({
    session
  });
  const mockContext = (session: any = {}, handler: any = () => {}) =>
    ({
      switchToHttp: () => ({
        getRequest: () => mockRequest(session)
      }),
      getHandler: () => handler
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    userService = {
      findByIdStrict: jest.fn()
    } as any;
    guard = new SessionGuard(reflector, userService);
  });

  it('should allow access if session exists and role matches', async () => {
    jest.spyOn(userService, 'findByIdStrict').mockResolvedValue(mockUser as unknown as User);
    jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

    const session = { payload: { id: 1, role: 'ADMIN' } };
    const context = mockContext(session, () => {});

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(session.payload.role).toBe('ADMIN');
  });

  it('should deny access if session exists but role does not match', async () => {
    jest.spyOn(userService, 'findByIdStrict').mockResolvedValue(mockUser as unknown as User);
    jest.spyOn(reflector, 'get').mockReturnValue(['MODERATOR']);

    const session = { payload: { id: 1, role: 'ADMIN' } };
    const context = mockContext(session, () => {});

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should allow access if no roles are required', async () => {
    jest.spyOn(userService, 'findByIdStrict').mockResolvedValue(mockUser as unknown as User);
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);

    const session = { payload: { id: 1, role: 'ADMIN' } };
    const context = mockContext(session, () => {});

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should deny access if session does not exist', async () => {
    const session = {};
    const context = mockContext(session, () => {});

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should deny access if user not found', async () => {
    jest.spyOn(userService, 'findByIdStrict').mockResolvedValue(null);

    const session = { payload: { id: 1, role: 'ADMIN' } };
    const context = mockContext(session, () => {});

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
