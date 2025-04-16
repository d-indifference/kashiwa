import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger, UnauthorizedException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnauthorizedExceptionFilter.name);

  public catch(exception: UnauthorizedException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse();

    this.logger.warn('[401] Unauthorized');

    response.status(HttpStatus.UNAUTHORIZED).render('error', {
      statusCode: response.statusCode,
      message: exception.message
    });
  }
}
