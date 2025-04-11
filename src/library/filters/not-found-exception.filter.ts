import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(NotFoundExceptionFilter.name);

  public catch(exception: NotFoundException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse();

    this.logger.warn('[404] Not found');

    response.status(HttpStatus.NOT_FOUND).render('error', {
      statusCode: response.statusCode,
      message: exception.message
    });
  }
}
