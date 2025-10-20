import { Body, Controller, Get, Post, Render, Res, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserAgentFilterService } from '@admin/services';
import { Roles } from '@admin/decorators';
import { UserRole } from '@prisma/client';
import { SessionGuard } from '@admin/guards';
import { ISession } from '@admin/interfaces';
import { RenderableSessionFormPage } from '@admin/lib';
import { FormDataRequest } from 'nestjs-form-data';
import { UserAgentForm } from '@admin/forms';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Controller('kashiwa/user-agents')
export class UserAgentFilterController {
  constructor(
    private readonly userAgentFilterService: UserAgentFilterService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(UserAgentFilterController.name);
  }

  @Get()
  @Roles(UserRole.ADMINISTRATOR, UserRole.MODERATOR)
  @UseGuards(SessionGuard)
  @Render('admin/common_form_page')
  public getIpFilterListForm(@Session() session: ISession): RenderableSessionFormPage {
    this.logger.debug({ session }, 'URL called: GET /kashiwa/user-agents');

    return this.userAgentFilterService.renderFormContent(session);
  }

  @Post()
  @Roles(UserRole.ADMINISTRATOR, UserRole.MODERATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async updateIpFilter(
    @Body(new ValidationPipe({ transform: true })) form: UserAgentForm,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug({ form }, 'URL called: POST /kashiwa/user-agents');

    await this.userAgentFilterService.saveUserAgentList(form, res);
  }
}
