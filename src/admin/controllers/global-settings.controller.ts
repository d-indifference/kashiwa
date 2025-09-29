import { Body, Controller, Get, Post, Render, Res, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { Roles } from '../decorators';
import { UserRole } from '@prisma/client';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { SessionGuard } from '@admin/guards';
import { ISession } from '@admin/interfaces';
import { RenderableSessionFormPage } from '@admin/lib';
import { GlobalSettingsForm } from '@admin/forms';
import { GlobalSettingsService } from '@admin/services';
import { PinoLogger } from 'nestjs-pino';

@Controller('kashiwa/global-settings')
export class GlobalSettingsController {
  constructor(
    private readonly globalSettingsService: GlobalSettingsService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(GlobalSettingsController.name);
  }

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/common_form_page')
  public getGlobalSettingsForm(@Session() session: ISession): RenderableSessionFormPage {
    this.logger.debug({ session }, 'URL called: GET /kashiwa/global-settings');

    return this.globalSettingsService.getGlobalSettings(session);
  }

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async updateGlobalSettingsForm(
    @Body(new ValidationPipe({ transform: true })) form: GlobalSettingsForm,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug({ form }, 'URL called: POST /kashiwa/global-settings');

    await this.globalSettingsService.saveGlobalSettings(form, res);
  }
}
