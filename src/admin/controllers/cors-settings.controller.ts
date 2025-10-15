import { Body, Controller, Get, Post, Render, Res, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { CorsSettingsService } from '@admin/services';
import { PinoLogger } from 'nestjs-pino';
import { Roles } from '@admin/decorators';
import { UserRole } from '@prisma/client';
import { SessionGuard } from '@admin/guards';
import { ISession } from '@admin/interfaces';
import { RenderableSessionFormPage } from '@admin/lib';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { CorsSettingsForm } from '@admin/forms/cors-settings.form';

@Controller('kashiwa/cors-settings')
export class CorsSettingsController {
  constructor(
    private readonly corsSettingsService: CorsSettingsService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(CorsSettingsController.name);
  }

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/common_form_page')
  public getIpFilterListForm(@Session() session: ISession): RenderableSessionFormPage {
    this.logger.debug({ session }, 'URL called: GET /kashiwa/cors-settings');

    return this.corsSettingsService.renderFormContent(session);
  }

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async updateIpFilter(
    @Body(new ValidationPipe({ transform: true })) form: CorsSettingsForm,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug({ form }, 'URL called: POST /kashiwa/cors-settings');

    await this.corsSettingsService.saveCorsSettings(form, res);
  }
}
