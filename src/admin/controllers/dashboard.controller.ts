import { Controller, Get, Render, Req, Session, UseGuards } from '@nestjs/common';
import { SessionGuard } from '@admin/guards';
import { ISession } from '@admin/interfaces';
import { Request } from 'express';
import { DashboardPage } from '@admin/pages/dashboard';
import { DashboardService } from '@admin/services';
import { fileSize } from '@library/page-compiler';

@Controller('kashiwa')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseGuards(SessionGuard)
  @Render('admin-dashboard')
  public async dashboard(
    @Session() session: ISession,
    @Req() req: Request
  ): Promise<DashboardPage & { fileSize: (size: number) => string }> {
    const page: DashboardPage = await this.dashboardService.getDashboardPage(req, session);

    return { ...page, fileSize };
  }
}
