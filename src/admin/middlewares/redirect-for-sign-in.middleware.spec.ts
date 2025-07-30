import { RedirectForSignInMiddleware } from './redirect-for-sign-in.middleware';
import { Request, Response, NextFunction } from 'express';
import { Session, SessionData } from 'express-session';
import { UserRole } from '@prisma/client';

type ExpressSessionType = Session & Partial<SessionData> & { payload: unknown };

type MockExpressRequest = {
  path: string;
  session: ExpressSessionType;
};

describe('RedirectForSignInMiddleware', () => {
  let middleware: RedirectForSignInMiddleware;
  let mockRequest: Partial<MockExpressRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new RedirectForSignInMiddleware();
    mockRequest = {};
    mockResponse = {
      redirect: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should call next() for non-admin panel routes', () => {
    mockRequest.path = '/';
    mockRequest.session = {} as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.redirect).not.toHaveBeenCalled();
  });

  it('should call next() for /kashiwa/auth/sign-in route', () => {
    mockRequest.path = '/kashiwa/auth/sign-in';
    mockRequest.session = {} as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.redirect).not.toHaveBeenCalled();
  });

  it('should call next() for /kashiwa/auth/sign-up route', () => {
    mockRequest.path = '/kashiwa/auth/sign-up';
    mockRequest.session = {} as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.redirect).not.toHaveBeenCalled();
  });

  it('should call next() for /kashiwa/post/:url route', () => {
    mockRequest.path = '/kashiwa/post/b';
    mockRequest.session = {} as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.redirect).not.toHaveBeenCalled();
  });

  it('should call next() for /kashiwa/post/:url/:num route', () => {
    mockRequest.path = '/kashiwa/post/b/1';
    mockRequest.session = {} as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.redirect).not.toHaveBeenCalled();
  });

  it('should call next() for /kashiwa/delete/:url route', () => {
    mockRequest.path = '/kashiwa/delete/b';
    mockRequest.session = {} as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.redirect).not.toHaveBeenCalled();
  });

  it('should call next() for /kashiwa/delete/:url/:num route', () => {
    mockRequest.path = '/kashiwa/delete/b/1';
    mockRequest.session = {} as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.redirect).not.toHaveBeenCalled();
  });

  it('should redirect to sign-in if not authenticated and route is protected', () => {
    mockRequest.path = '/kashiwa/ban';
    mockRequest.session = {} as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/kashiwa/auth/sign-in');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() if authenticated and route is protected', () => {
    mockRequest.path = '/kashiwa/ban';
    mockRequest.session = { payload: { id: '1', role: UserRole.ADMINISTRATOR } } as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.redirect).not.toHaveBeenCalled();
  });

  it('should call next() for /kashiwa (root admin panel) if authenticated', () => {
    mockRequest.path = '/kashiwa';
    mockRequest.session = { payload: { id: '1', role: UserRole.ADMINISTRATOR } } as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.redirect).not.toHaveBeenCalled();
  });

  it('should redirect for /kashiwa (root admin panel) if not authenticated', () => {
    mockRequest.path = '/kashiwa';
    mockRequest.session = {} as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/kashiwa/auth/sign-in');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() for deeply nested protected route if authenticated', () => {
    mockRequest.path = '/kashiwa/ban/new';
    mockRequest.session = { payload: { id: '1', role: UserRole.ADMINISTRATOR } } as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.redirect).not.toHaveBeenCalled();
  });

  it('should redirect for deeply nested protected route if not authenticated', () => {
    mockRequest.path = '/kashiwa/settings/advanced';
    mockRequest.session = {} as ExpressSessionType;
    middleware.use(mockRequest as unknown as Request, mockResponse as Response, mockNext);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/kashiwa/auth/sign-in');
    expect(mockNext).not.toHaveBeenCalled();
  });
});
