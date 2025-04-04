import { Injectable, Inject } from '@nestjs/common';
import * as pug from 'pug';
import * as path from 'path';
import * as fs from 'fs';
import { PugModuleOptions } from '@library/pug/pug.module';

/**
 * Service for rendering Pug templates to HTML strings.
 */
@Injectable()
export class PugService {
  constructor(@Inject('PUG_OPTIONS') private options: PugModuleOptions) {}

  /**
   * Renders a Pug template file to an HTML string.
   * @param templateName - Name of the template file (without `.pug` extension).
   * @param locals - Optional object containing variables to pass into the template.
   */
  public render(templateName: string, locals: Record<string, any> = {}): string {
    const templatePath = path.join(this.options.templatesPath, `${templateName}.pug`);
    const template = fs.readFileSync(templatePath, 'utf-8');

    return pug.render(template, locals);
  }
}
