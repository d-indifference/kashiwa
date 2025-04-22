import { Body, Controller, Get, Post, Render, Res, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { ISession } from '@admin/interfaces';
import { SessionPage } from '@admin/pages';
import { Roles } from '@admin/decorators';
import { UserRole } from '@prisma/client';
import { SessionGuard } from '@admin/guards';
import { SpamService } from '@admin/services';
import { FormDataRequest } from 'nestjs-form-data';
import { SpamForm } from '@admin/forms/spam';
import { Response } from 'express';

@Controller('kashiwa/spam')
export class SpamController {
  constructor(private readonly spamService: SpamService) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/spam/admin-spam-form')
  public getSpamListForm(@Session() session: ISession): SessionPage {
    return this.spamService.renderFormContent(session);
  }

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async updateSpamList(
    @Body(new ValidationPipe({ transform: true })) form: SpamForm,
    @Res() res: Response
  ): Promise<void> {
    await this.spamService.saveSpamList(form, res);
  }
}
