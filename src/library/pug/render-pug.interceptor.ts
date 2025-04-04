import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { PugService } from '@library/pug/pug.service';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { RENDER_PUG_KEY, RenderPugOptions } from '@library/pug/render-pug.decorator';
import { Response } from 'express';

/**
 * Interceptor responsible for rendering Pug templates.
 */
@Injectable()
export class PugRenderInterceptor implements NestInterceptor {
  /**
   * Creates an instance of the PugRenderInterceptor.
   * @param reflector - Used to access metadata set by the `@RenderPug()` decorator.
   * @param pugRenderService - Service used to render Pug templates.
   */
  constructor(
    private readonly reflector: Reflector,
    private readonly pugRenderService: PugService
  ) {}

  /**
   * Intercepts the request and processes the controller's response data through a Pug template if rendering metadata is present.
   * @param context - The current execution context.
   * @param next - A handler to proceed to the next step in the request pipeline.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const renderOptions = this.reflector.get<RenderPugOptions>(RENDER_PUG_KEY, context.getHandler());

    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map(handlerData => {
        const html = this.pugRenderService.render(renderOptions.template, {
          ...(renderOptions.staticLocals || {}),
          ...(handlerData || {})
        });
        response.type('text/html').send(html);
      })
    );
  }
}
