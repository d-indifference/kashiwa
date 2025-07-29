import { ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProtectSignInMiddleware } from './protect-sign-in.middleware';
import { ISession } from '@admin/interfaces';
import { LOCALE } from '@locale/locale';
import { UserRole } from '@prisma/client';

describe('ProtectSignInMiddleware', () => {
  let middleware: ProtectSignInMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new ProtectSignInMiddleware();
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('use', () => {
    it('should call next() when user is not signed in (no session payload)', () => {
      const session: Partial<ISession> = { payload: undefined };
      mockRequest.session = session as any;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should call next() when session is empty', () => {
      const session: Partial<ISession> = {};
      mockRequest.session = session as any;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should call next() when session is null', () => {
      mockRequest.session = null as any;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should throw ForbiddenException when user is already signed in', () => {
      const session: Partial<ISession> = {
        payload: {
          id: '1',
          role: UserRole.ADMINISTRATOR
        }
      };
      mockRequest.session = session as any;

      // Act & Assert
      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ForbiddenException);

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(LOCALE['ALREADY_SIGNED_IN'] as string);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException with correct message when user has any role', () => {
      const testCases = [
        { id: '1', role: UserRole.ADMINISTRATOR },
        { id: '2', role: UserRole.MODERATOR }
      ];

      testCases.forEach(testCase => {
        const session: Partial<ISession> = {
          payload: testCase
        };
        mockRequest.session = session as any;

        expect(() => {
          middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
        }).toThrow(ForbiddenException);

        expect(() => {
          middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
        }).toThrow(LOCALE['ALREADY_SIGNED_IN'] as string);
      });
    });

    it('should handle session with payload but empty id', () => {
      const session: Partial<ISession> = {
        payload: {
          id: '',
          role: UserRole.ADMINISTRATOR
        }
      };
      mockRequest.session = session as any;

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ForbiddenException);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle session with payload but null id', () => {
      const session: Partial<ISession> = {
        payload: {
          id: null as any,
          role: UserRole.ADMINISTRATOR
        }
      };
      mockRequest.session = session as any;

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ForbiddenException);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
