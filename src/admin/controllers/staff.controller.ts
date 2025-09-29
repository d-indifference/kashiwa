import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Render,
  Res,
  Session,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { StaffService } from '@admin/services';
import { Roles } from '@admin/decorators';
import { UserRole } from '@prisma/client';
import { SessionGuard } from '@admin/guards';
import { PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { TablePage } from '@admin/pages';
import { FormPage, RenderableSessionFormPage } from '@admin/lib';
import { StaffCreateForm, StaffUpdateForm, StaffUpdateMyselfForm } from '@admin/forms/staff';
import { LOCALE } from '@locale/locale';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

const getDefaultNewStaffMemberForm = (): StaffCreateForm => {
  const form = new StaffCreateForm();
  form.role = UserRole.MODERATOR;
  return form;
};

@Controller('kashiwa/staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(StaffController.name);
  }

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/common_table_page')
  public async getList(
    @Query(new ValidationPipe({ transform: true })) page: PageRequest,
    @Session() session: ISession
  ): Promise<TablePage> {
    this.logger.debug({ session, page }, 'URL called: GET /kashiwa/staff');

    return await this.staffService.getList(page, session);
  }

  @Get('my')
  @UseGuards(SessionGuard)
  @Render('admin/common_form_page')
  public async getMyProfileForm(@Session() session: ISession): Promise<RenderableSessionFormPage> {
    this.logger.debug({ session }, 'URL called: GET /kashiwa/staff/my');

    return await this.staffService.getMyProfileForm(session);
  }

  @Get('new')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/common_form_page')
  public getCreationForm(@Session() session: ISession): RenderableSessionFormPage {
    this.logger.debug({ session }, 'URL called: GET /kashiwa/staff/new');

    const form = getDefaultNewStaffMemberForm();

    return FormPage.toSessionTemplateContent(session, form, {
      pageTitle: LOCALE.STAFF_PANEL as string,
      pageSubtitle: LOCALE.NEW_STAFF_MEMBER as string,
      goBack: '/kashiwa/staff'
    });
  }

  @Get('edit/:id')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/common_form_page')
  public async getUpdateForm(
    @Session() session: ISession,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<RenderableSessionFormPage> {
    this.logger.debug({ session }, `URL called: GET /kashiwa/staff/edit/${id}`);

    return await this.staffService.getForUpdate(session, id);
  }

  @Post('new')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async createUser(
    @Body(new ValidationPipe({ transform: true })) form: StaffCreateForm,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug({ form }, 'URL called: POST /kashiwa/staff/new');

    await this.staffService.create(form, res);
  }

  @Post('my')
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async updateMyProfile(
    @Body(new ValidationPipe({ transform: true })) form: StaffUpdateMyselfForm,
    @Session() session: ISession,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug({ session, form }, 'URL called: POST /kashiwa/staff/my');

    return await this.staffService.update(form, res, '/kashiwa', session);
  }

  @Post('edit')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async updateUser(
    @Body(new ValidationPipe({ transform: true })) form: StaffUpdateForm,
    @Session() session: ISession,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug({ session, form }, 'URL called: POST /kashiwa/staff/edit');

    await this.staffService.update(form, res, `/kashiwa/staff/edit/${form.id}`, session);
  }

  @Post('delete/:id')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  public async deleteUser(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    this.logger.debug(`URL called: POST /kashiwa/staff/delete/${id}`);

    await this.staffService.remove(id, res);
  }
}
