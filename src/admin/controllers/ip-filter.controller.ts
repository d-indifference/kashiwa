import { ISession } from '@admin/interfaces';
import { IpFilterService } from '@admin/services';
import { Body, Controller, Get, Post, Render, Res, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { RenderableSessionFormPage } from '@admin/lib';
import { UserRole } from '@prisma/client';
import { Roles } from '@admin/decorators';
import { SessionGuard } from '@admin/guards';
import { FormDataRequest } from 'nestjs-form-data';
import { IpFilterForm } from '@admin/forms';
import { Response } from 'express';

@Controller('kashiwa/ip-filter')
export class IpFilterController {
  constructor(private readonly ipFilterService: IpFilterService) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/common_form_page')
  public async getIpFilterListForm(@Session() session: ISession): Promise<RenderableSessionFormPage> {
    return await this.ipFilterService.renderFormContent(session);
  }

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async updateIpFilter(
    @Body(new ValidationPipe({ transform: true })) form: IpFilterForm,
    @Res() res: Response
  ): Promise<void> {
    await this.ipFilterService.saveIpFilter(form, res);
  }
}
