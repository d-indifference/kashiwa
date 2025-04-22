import { Body, Controller, Get, Post, Render, Res, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { ISession } from '@admin/interfaces';
import { SessionPage } from '@admin/pages';
import { Roles } from '@admin/decorators';
import { UserRole } from '@prisma/client';
import { SessionGuard } from '@admin/guards';
import { IpFilterService } from '@admin/services';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { IpFilterForm } from '@admin/forms/ip-filter';

@Controller('kashiwa/ip-filter')
export class IpFilterController {
  constructor(private readonly ipFilterService: IpFilterService) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/ip-filter/admin-ip-filter-form')
  public getIpFilterListForm(@Session() session: ISession): SessionPage {
    return this.ipFilterService.renderFormContent(session);
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
