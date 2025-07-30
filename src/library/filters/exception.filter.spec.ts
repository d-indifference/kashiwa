import { ExceptionFilter } from './exception.filter';
import { PinoLogger } from 'nestjs-pino';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

const LOCALE = {
  UNEXPECTED_EXCEPTION: 'Unexpected exception',
  ERROR: 'Error'
};

class ErrorPage {
  constructor(
    public title: string,
    public message: string | object
  ) {}
}

describe('ExceptionFilter', () => {
  let filter: ExceptionFilter;
  let logger: PinoLogger;

  beforeEach(() => {
    logger = {
      setContext: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as any;
    filter = new ExceptionFilter(logger);
  });

  const getMockArgumentsHost = (req: any, res: any): ArgumentsHost =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res
      })
    }) as unknown as ArgumentsHost;

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException', () => {
    const errorPageObj = { commons: { pageTitle: 'Error' }, message: 'Forbidden' };
    const req = { method: 'GET', url: '/test' };
    const render = jest.fn();
    const res = { status: jest.fn(() => res), render };

    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const host = getMockArgumentsHost(req, res);

    filter.catch(exception, host);

    expect(logger.setContext).toHaveBeenCalledWith('ExceptionFilter');
    expect(render).toHaveBeenCalledWith('error', errorPageObj);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
  });

  it('should handle Error', () => {
    const errorPageObj = { commons: { pageTitle: 'Error' }, message: 'Some error' };
    const req = { method: 'POST', url: '/err' };
    const render = jest.fn();
    const res = { status: jest.fn(() => res), render };

    const exception = new Error('Some error');
    const host = getMockArgumentsHost(req, res);

    filter.catch(exception, host);

    expect(render).toHaveBeenCalledWith('error', errorPageObj);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should handle unknown exception', () => {
    const errorPageObj = { commons: { pageTitle: 'Error' }, message: 'Unexpected exception occurred' };
    const req = { method: 'PUT', url: '/unknown' };
    const render = jest.fn();
    const res = { status: jest.fn(() => res), render };

    const exception = 'unknown';
    const host = getMockArgumentsHost(req, res);

    filter.catch(exception, host);

    expect(render).toHaveBeenCalledWith('error', errorPageObj);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should format BAD_REQUEST message as array', () => {
    const req = { method: 'PATCH', url: '/bad' };
    const render = jest.fn();
    const res = { status: jest.fn(() => res), render };

    const messageArr = ['field1', 'field2'];
    const getResponse = () => ({ message: messageArr });
    const exception = new HttpException(getResponse(), HttpStatus.BAD_REQUEST);
    Object.defineProperty(exception, 'message', { value: 'Bad Request', writable: true });
    const host = getMockArgumentsHost(req, res);

    filter.catch(exception, host);

    const rendered = render.mock.calls[0][1] as ErrorPage;
    expect(rendered.message).toContain('field1');
    expect(rendered.message).toContain('field2');
    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should format BAD_REQUEST message as string', () => {
    const req = { method: 'PATCH', url: '/bad-string' };
    const render = jest.fn();
    const res = { status: jest.fn(() => res), render };

    const getResponse = () => ({ message: 'single error' });
    const exception = new HttpException(getResponse(), HttpStatus.BAD_REQUEST);
    Object.defineProperty(exception, 'message', { value: 'Bad Request', writable: true });
    const host = getMockArgumentsHost(req, res);

    filter.catch(exception, host);

    const rendered = render.mock.calls[0][1] as ErrorPage;
    expect(rendered.message).toContain('single error');
    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });
});
