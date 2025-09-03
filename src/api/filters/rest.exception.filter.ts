import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';
import { LOCALE } from '@locale/locale';
import { ErrorDto } from '@api/dto/v1';
import { ExceptionLogger } from '@library/misc';

@Catch()
export class RestExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  /**
   * REST API exception filter
   */
  public catch(exception: any, host: ArgumentsHost) {
    this.logger.setContext(RestExceptionFilter.name);

    const context = host.switchToHttp();
    const response: Response = context.getResponse();
    const request: Request = context.getRequest();

    let statusCode: HttpStatus;
    let message: string;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = this.processHttpExceptionMessage(exception);
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = LOCALE['UNEXPECTED_EXCEPTION'] as string;
    }

    this.logException(exception, request);

    response.status(statusCode.valueOf()).send(new ErrorDto(statusCode, message));
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
      exceptionMessage += (failedFields as string[]).join('');
    } else {
      exceptionMessage = failedFields as string;
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
