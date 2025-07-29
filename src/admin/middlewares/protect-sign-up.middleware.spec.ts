import { ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProtectSignUpMiddleware } from './protect-sign-up.middleware';
import { UserPersistenceService } from '@persistence/services';
import { LOCALE } from '@locale/locale';

describe('ProtectSignUpMiddleware', () => {
  let middleware: ProtectSignUpMiddleware;
  let mockUserService: jest.Mocked<UserPersistenceService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockUserService = {
      countAll: jest.fn()
    } as any;

    middleware = new ProtectSignUpMiddleware(mockUserService);
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('use', () => {
    it('should call next() when no users exist in database (count = 0)', async () => {
      mockUserService.countAll.mockResolvedValue(0);

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.countAll).toHaveBeenCalledWith();
      expect(mockUserService.countAll).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should throw ForbiddenException when users exist in database (count > 0)', async () => {
      mockUserService.countAll.mockResolvedValue(1);

      await expect(middleware.use(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(
        ForbiddenException
      );

      await expect(middleware.use(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(
        LOCALE['YOU_DONT_NEED_TO_SIGN_UP'] as string
      );

      expect(mockUserService.countAll).toHaveBeenCalledWith();
      expect(mockUserService.countAll).toHaveBeenCalledTimes(2);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when multiple users exist in database', async () => {
      const testCases = [1, 5, 10, 100];

      for (const count of testCases) {
        mockUserService.countAll.mockResolvedValue(count);

        await expect(middleware.use(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(
          ForbiddenException
        );

        await expect(middleware.use(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(
          LOCALE['YOU_DONT_NEED_TO_SIGN_UP'] as string
        );
      }

      expect(mockUserService.countAll).toHaveBeenCalledTimes(testCases.length * 2);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database errors from countAll method', async () => {
      const databaseError = new Error('Database connection failed');
      mockUserService.countAll.mockRejectedValue(databaseError);

      await expect(middleware.use(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(
        databaseError
      );

      expect(mockUserService.countAll).toHaveBeenCalledWith();
      expect(mockUserService.countAll).toHaveBeenCalledTimes(1);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle null response from countAll method', async () => {
      mockUserService.countAll.mockResolvedValue(null as any);

      await expect(middleware.use(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(
        ForbiddenException
      );

      expect(mockUserService.countAll).toHaveBeenCalledWith();
      expect(mockUserService.countAll).toHaveBeenCalledTimes(1);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle undefined response from countAll method', async () => {
      mockUserService.countAll.mockResolvedValue(undefined as any);

      await expect(middleware.use(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(
        ForbiddenException
      );

      expect(mockUserService.countAll).toHaveBeenCalledWith();
      expect(mockUserService.countAll).toHaveBeenCalledTimes(1);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle negative count response from countAll method', async () => {
      mockUserService.countAll.mockResolvedValue(-1);

      await expect(middleware.use(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(
        ForbiddenException
      );

      expect(mockUserService.countAll).toHaveBeenCalledWith();
      expect(mockUserService.countAll).toHaveBeenCalledTimes(1);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call countAll method exactly once per request', async () => {
      mockUserService.countAll.mockResolvedValue(0);

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.countAll).toHaveBeenCalledTimes(1);
    });

    it('should not call next() when ForbiddenException is thrown', async () => {
      mockUserService.countAll.mockResolvedValue(1);

      try {
        await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(mockNext).not.toHaveBeenCalled();
      }
    });
  });
});
