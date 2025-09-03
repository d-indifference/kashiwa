import { PinoLogger } from 'nestjs-pino';
import { Request } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';

export class ExceptionLogger {
  public static logException(logger: PinoLogger, exception: unknown, request: Request): void {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status >= HttpStatus.BAD_REQUEST.valueOf()) {
        logger.warn({ message: exception.message }, `[${status}] ${exception.name}`);
      } else {
        logger.error(
          {
            method: request.method,
            url: request.url,
            status,
            exception,
            stack: exception.stack ? exception.stack : undefined
          },
          `[${status}] ${exception.name}`
        );
      }
    } else if (exception instanceof Error) {
      logger.error(
        {
          method: request.method,
          url: request.url,
          status: HttpStatus.INTERNAL_SERVER_ERROR.valueOf(),
          exception,
          stack: exception.stack ? exception.stack : undefined
        },
        `[${HttpStatus.INTERNAL_SERVER_ERROR.valueOf()}] Internal Server Error`
      );
    } else {
      logger.error(
        {
          method: request.method,
          url: request.url,
          status: HttpStatus.INTERNAL_SERVER_ERROR.valueOf(),
          exception,
          stack: exception instanceof Error ? exception.stack : undefined
        },
        `[${HttpStatus.INTERNAL_SERVER_ERROR.valueOf()}] Internal Server Error`
      );
    }
  }
}
