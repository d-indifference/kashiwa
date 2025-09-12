import { RestExceptionFilter } from './rest.exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { ErrorDto } from '@api/dto/v1';
import { LOCALE } from '@locale/locale';
import { ExceptionLogger } from '@library/misc';

jest.mock('@library/misc', () => ({
  ExceptionLogger: {
    logException: jest.fn()
  }
}));

describe('RestExceptionFilter', () => {
  let loggerMock: jest.Mocked<PinoLogger>;
  let filter: RestExceptionFilter;
  let responseMock: any;
  let requestMock: any;
  let contextMock: any;
  let hostMock: any;

  beforeEach(() => {
    loggerMock = {
      setContext: jest.fn()
    } as any;

    filter = new RestExceptionFilter(loggerMock);

    responseMock = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    requestMock = { url: '/test' };

    contextMock = {
      getResponse: jest.fn(() => responseMock),
      getRequest: jest.fn(() => requestMock)
    };

    hostMock = {
      switchToHttp: jest.fn(() => contextMock)
    };
  });

  it('should set logger context when catch called', () => {
    const exception = new Error('Some error');
    filter.catch(exception, hostMock as unknown as ArgumentsHost);
    expect(loggerMock.setContext).toHaveBeenCalledWith('RestExceptionFilter');
  });

  it('should handle HttpException and process message', () => {
    const exception = new HttpException('error_msg', HttpStatus.NOT_FOUND);
    jest.spyOn(filter as any, 'processHttpExceptionMessage').mockReturnValue('processedMsg');

    filter.catch(exception, hostMock as unknown as ArgumentsHost);

    expect((filter as any).processHttpExceptionMessage).toHaveBeenCalledWith(exception);
    expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(responseMock.send).toHaveBeenCalledWith(expect.any(ErrorDto));
    const sentDto = responseMock.send.mock.calls[0][0];
    expect(sentDto.message).toBe('processedMsg');
    expect(sentDto.statusCode).toBe(HttpStatus.NOT_FOUND);
  });

  it('should handle generic Error as internal server error', () => {
    const exception = new Error('Some error');
    filter.catch(exception, hostMock as unknown as ArgumentsHost);
    expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(responseMock.send).toHaveBeenCalledWith(expect.any(ErrorDto));
    const sentDto = responseMock.send.mock.calls[0][0];
    expect(sentDto.message).toBe('Some error');
    expect(sentDto.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should handle unknown exception as internal server error', () => {
    (LOCALE as any)['UNEXPECTED_EXCEPTION'] = 'unexpected error';
    filter.catch({ foo: 'bar' }, hostMock as unknown as ArgumentsHost);
    expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(responseMock.send).toHaveBeenCalledWith(expect.any(ErrorDto));
    const sentDto = responseMock.send.mock.calls[0][0];
    expect(sentDto.message).toBe('unexpected error');
    expect(sentDto.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  describe('processHttpExceptionMessage', () => {
    it('should call processBadRequestMessage for BAD_REQUEST', () => {
      const exception = new HttpException('bad request', HttpStatus.BAD_REQUEST);
      jest.spyOn(filter as any, 'processBadRequestMessage').mockReturnValue('badFields');
      const result = (filter as any).processHttpExceptionMessage(exception);
      expect((filter as any).processBadRequestMessage).toHaveBeenCalledWith(exception);
      expect(result).toBe('badFields');
    });

    it('should return exception.message for other statuses', () => {
      const exception = new HttpException('other error', HttpStatus.FORBIDDEN);
      const result = (filter as any).processHttpExceptionMessage(exception);
      expect(result).toBe('other error');
    });
  });

  describe('processBadRequestMessage', () => {
    it('should join array of failed fields', () => {
      const exception = new HttpException({ message: ['field1', 'field2'] }, HttpStatus.BAD_REQUEST);
      exception.getResponse = () => ({ message: ['field1', 'field2'] });
      const result = (filter as any).processBadRequestMessage(exception);
      expect(result).toBe('field1field2');
    });

    it('should return string failed field', () => {
      const exception = new HttpException({ message: 'singleField' }, HttpStatus.BAD_REQUEST);
      exception.getResponse = () => ({ message: 'singleField' });
      const result = (filter as any).processBadRequestMessage(exception);
      expect(result).toBe('singleField');
    });
  });

  it('should call ExceptionLogger.logException', () => {
    const exception = new Error('ex');
    filter.catch(exception, hostMock as unknown as ArgumentsHost);
    expect(ExceptionLogger.logException).toHaveBeenCalledWith(loggerMock, exception, requestMock);
  });
});
