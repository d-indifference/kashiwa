import { Body, Controller, Get, Post, Render, Res, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { Roles } from '@admin/decorators';
import { UserRole } from '@prisma/client';
import { SessionGuard } from '@admin/guards';
import { ISession } from '@admin/interfaces';
import { FormPage } from '@admin/pages';
import { GlobalSettingsService } from '@admin/services';
import { GlobalSettingsForm } from '@admin/forms/global-settings';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';

@Controller('kashiwa/global-settings')
export class GlobalSettingsController {
  constructor(private readonly globalSettingsService: GlobalSettingsService) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/global-settings/admin-global-settings-form')
  public getGlobalSettingsForm(@Session() session: ISession): FormPage<GlobalSettingsForm> {
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
    return await this.globalSettingsService.saveGlobalSettings(form, res);
  }
}
