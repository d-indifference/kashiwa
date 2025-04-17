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
import { ISession } from '@admin/interfaces';
import { SessionGuard } from '@admin/guards';
import { Roles } from '@admin/decorators';
import { UserRole } from '@prisma/client';
import { StaffService } from '@admin/services';
import { PageRequest } from '@persistence/lib/page';
import { FormPage, ListPage } from '@admin/pages';
import { UserDto } from '@persistence/dto/user';
import { FormDataRequest } from 'nestjs-form-data';
import { StaffCreateForm, StaffUpdateForm } from '@admin/forms/staff';
import { Response } from 'express';

@Controller('kashiwa/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/staff/admin-staff-list')
  public async getList(
    @Query(new ValidationPipe({ transform: true })) page: PageRequest,
    @Session() session: ISession
  ): Promise<ListPage<UserDto>> {
    return await this.staffService.getList(page, session);
  }

  @Get('my')
  @UseGuards(SessionGuard)
  @Render('admin/staff/admin-staff-form-profile')
  public async getMyProfileForm(@Session() session: ISession): Promise<FormPage<StaffUpdateForm>> {
    return await this.staffService.getMyProfileForm(session);
  }

  @Get('new')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/staff/admin-staff-form')
  public getCreationForm(@Session() session: ISession): FormPage<UserDto> {
    return new FormPage(session, 'CREATE');
  }

  @Get('edit/:id')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @Render('admin/staff/admin-staff-form')
  public async getUpdateForm(
    @Session() session: ISession,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<FormPage<StaffUpdateForm>> {
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
    await this.staffService.create(form, res);
  }

  @Post('my')
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async updateMyProfile(
    @Body(new ValidationPipe({ transform: true })) form: StaffUpdateForm,
    @Res() res: Response
  ): Promise<void> {
    return await this.staffService.update(form, res, '/kashiwa');
  }

  @Post('edit')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async updateUser(
    @Body(new ValidationPipe({ transform: true })) form: StaffUpdateForm,
    @Res() res: Response
  ): Promise<void> {
    await this.staffService.update(form, res, `/kashiwa/staff/edit/${form.id}`);
  }

  @Post('delete/:id')
  @Roles(UserRole.ADMINISTRATOR)
  @UseGuards(SessionGuard)
  public async deleteUser(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.staffService.remove(id, res);
  }
}
