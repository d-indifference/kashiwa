import { Test, TestingModule } from '@nestjs/testing';
import { UserAgentGuard } from '@restriction/modules/user-agent-restriction/guards/user-agent.guard';
import { ForbiddenUserAgentsProvider } from '@restriction/modules/user-agent-restriction/providers';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { LOCALE } from '@locale/locale';

describe('UserAgentGuard', () => {
  let guard: UserAgentGuard;
  let provider: jest.Mocked<ForbiddenUserAgentsProvider>;

  beforeEach(async () => {
    provider = {
      checkUserAgent: jest.fn()
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAgentGuard, { provide: ForbiddenUserAgentsProvider, useValue: provider }]
    }).compile();

    guard = module.get<UserAgentGuard>(UserAgentGuard);
  });

  afterEach(() => jest.clearAllMocks());

  const mockExecutionContext = (req: Partial<Request>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => req
      })
    }) as unknown as ExecutionContext;

  it('should allow request when provider returns true', () => {
    const request = { session: {}, get: jest.fn() } as unknown as Request;
    provider.checkUserAgent.mockReturnValue(true);
    const context = mockExecutionContext(request);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(provider.checkUserAgent).toHaveBeenCalledWith(request, false);
  });

  it('should allow admin session (session.payload = truthy)', () => {
    const request = { session: { payload: { userId: 1 } }, get: jest.fn() } as unknown as Request;
    provider.checkUserAgent.mockReturnValue(true);
    const context = mockExecutionContext(request);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(provider.checkUserAgent).toHaveBeenCalledWith(request, true);
  });

  it('should throw ForbiddenException when provider returns false', () => {
    const request = { session: {}, get: jest.fn() } as unknown as Request;
    provider.checkUserAgent.mockReturnValue(false);
    const context = mockExecutionContext(request);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(LOCALE.BLOCKED_REQUEST as string);
  });
});
