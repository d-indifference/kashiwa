import { Controller, Get, Render, Session, UseGuards } from '@nestjs/common';
import { SessionGuard } from '@admin/guards';
import { ISession, ISessionPayload } from '@admin/interfaces';

@Controller('kashiwa')
export class DashboardController {
  @Get()
  @UseGuards(SessionGuard)
  @Render('admin-dashboard')
  public dashboard(@Session() session: ISession): ISessionPayload {
    return session.payload;
  }
}
