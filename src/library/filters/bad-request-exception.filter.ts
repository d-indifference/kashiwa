import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import * as _ from 'lodash';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BadRequestException.name);

  public catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse();

    this.logger.warn('[400] Bad Request');

    const exceptionResponse = exception.getResponse();
    const failedFields: string[] | string = exceptionResponse['message'];

    let exceptionMessage = '';

    if (_.has(exceptionMessage, 'map')) {
      exceptionMessage = (failedFields as string[])
        .map(message => `<p>${message[0].toUpperCase() + message.slice(1)}</p>`)
        .join('\n');
    } else {
      exceptionMessage = `<p>${failedFields as string}</p>`;
    }

    response.status(HttpStatus.BAD_REQUEST).render('error', {
      statusCode: response.statusCode,
      message: exceptionMessage
    });
  }
}
