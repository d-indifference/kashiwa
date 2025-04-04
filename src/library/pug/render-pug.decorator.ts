import { applyDecorators, UseInterceptors, SetMetadata } from '@nestjs/common';
import { PugRenderInterceptor } from '@library/pug/render-pug.interceptor';

/**
 * Metadata key used to store Pug rendering options.
 */
export const RENDER_PUG_KEY = 'RENDER_PUG_OPTIONS';

/**
 * Options for rendering a Pug template using the `RenderPug` decorator.
 */
export interface RenderPugOptions {
  /**
   * Name of the Pug template file (without `.pug` extension).
   */
  template: string;

  /**
   * Optional static variables to be passed into the template at render time.
   */
  staticLocals?: Record<string, any>;
}
/**
 * A method decorator for rendering a Pug template in a controller handler.
 *
 * This decorator registers metadata and applies the {@link PugRenderInterceptor},
 * which is responsible for rendering the specified Pug template using the data
 * returned from the controller method.
 */
export const RenderPug = (template: string, staticLocals: Record<string, any> = {}) => {
  return applyDecorators(
    SetMetadata(RENDER_PUG_KEY, { template, staticLocals }),
    UseInterceptors(PugRenderInterceptor)
  );
};
