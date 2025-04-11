import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException, HttpStatus, Logger } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ForbiddenExceptionFilter.name);

  public catch(exception: ForbiddenException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse();

    this.logger.warn('[403] Forbidden');

    response.status(HttpStatus.FORBIDDEN).render('error', {
      statusCode: response.statusCode,
      message: exception.message
    });
  }
}
