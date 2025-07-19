import { Body, Controller, Get, Post, Render, Res, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { SessionGuard } from '@admin/guards';
import { UserRole } from '@prisma/client';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { Roles } from '@admin/decorators';
import { ISession } from '@admin/interfaces';
import { RenderableSessionFormPage } from '@admin/lib';
import { SpamListForm } from '@admin/forms';
import { SpamListService } from '@admin/services';

@Controller('kashiwa/spam')
export class SpamListController {
  constructor(private readonly spamListService: SpamListService) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/common_form_page')
  public async getSpamListForm(@Session() session: ISession): Promise<RenderableSessionFormPage> {
    return await this.spamListService.renderFormContent(session);
  }

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async updateSpamList(
    @Body(new ValidationPipe({ transform: true })) form: SpamListForm,
    @Res() res: Response
  ): Promise<void> {
    await this.spamListService.saveSpamList(form, res);
  }
}
