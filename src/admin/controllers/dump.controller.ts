import { Body, Controller, Get, Post, Render, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { Roles } from '@admin/decorators';
import { UserRole } from '@prisma/client';
import { SessionGuard } from '@admin/guards';
import { ISession } from '@admin/interfaces';
import { FormPage } from '@admin/pages';
import { DumpService } from '@admin/services';
import { FormDataRequest } from 'nestjs-form-data';
import { DumpForm } from '@admin/forms/dump';

@Controller('kashiwa/dump')
export class DumpController {
  constructor(private readonly dumpService: DumpService) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/dump/admin-dump-form')
  public index(@Session() session: ISession): FormPage<DumpForm> {
    return this.dumpService.getForm(session);
  }

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  @Render('admin/dump/admin-dump-form')
  public async makeDump(
    @Session() session: ISession,
    @Body(new ValidationPipe({ transform: true })) form: DumpForm
  ): Promise<FormPage<DumpForm>> {
    return await this.dumpService.processDump(session, form);
  }
}
