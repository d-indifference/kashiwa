import { ArgumentsHost, Catch, ExceptionFilter as IExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { LOCALE } from '@locale/locale';
import { Request, Response } from 'express';
import { ErrorPage, ExceptionLogger } from '@library/misc';

@Catch()
export class ExceptionFilter implements IExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  /**
   * Application exception filter
   */
  public catch(exception: unknown, host: ArgumentsHost): void {
    this.logger.setContext(ExceptionFilter.name);

    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const request: Request = ctx.getRequest();

    let statusCode: HttpStatus;
    let message: string | object;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = this.processHttpExceptionMessage(exception);
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = LOCALE['UNEXPECTED_EXCEPTION'];
    }

    this.logException(exception, request);

    response.status(statusCode.valueOf()).render('error', new ErrorPage(LOCALE.ERROR as string, message));
  }

  /**
   * Process exception message based on exception status
   */
  private processHttpExceptionMessage(exception: HttpException): string {
    if (exception.getStatus() === HttpStatus.BAD_REQUEST.valueOf()) {
      return this.processBadRequestMessage(exception);
    }

    return exception.message;
  }

  /**
   * Process format for bad request exception message
   */
  private processBadRequestMessage(exception: HttpException): string {
    const exceptionResponse = exception.getResponse();
    const failedFields: string[] | string = exceptionResponse['message'];

    let exceptionMessage = '';

    if (Array.isArray(failedFields)) {
      exceptionMessage += `<p>${(failedFields as string[]).join('')}</p>`;
    } else {
      exceptionMessage = `<p>${failedFields as string}</p>`;
    }

    return exceptionMessage;
  }

  /**
   * Exception logging depends on exception type
   */
  private logException(exception: unknown, request: Request): void {
    ExceptionLogger.logException(this.logger, exception, request);
  }
}
