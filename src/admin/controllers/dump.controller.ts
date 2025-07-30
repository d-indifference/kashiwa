import { Body, Controller, Get, Post, Render, Res, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { Roles } from '@admin/decorators';
import { UserRole } from '@prisma/client';
import { SessionGuard } from '@admin/guards';
import { ISession } from '@admin/interfaces';
import { DumpService } from '@admin/services';
import { RenderableSessionFormPage } from '@admin/lib';
import { FormDataRequest } from 'nestjs-form-data';
import { DumpForm } from '@admin/forms';
import { Response } from 'express';

@Controller('kashiwa/dump')
export class DumpController {
  constructor(private readonly dumpService: DumpService) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/common_form_page')
  public index(@Session() session: ISession): RenderableSessionFormPage {
    return this.dumpService.getForm(session);
  }

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async makeDump(
    @Body(new ValidationPipe({ transform: true })) form: DumpForm,
    @Res() res: Response
  ): Promise<void> {
    await this.dumpService.processDump(form, res);
  }
}
