import {
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
import { ReportService } from '@admin/services';
import { PinoLogger } from 'nestjs-pino';
import { SessionGuard } from '@admin/guards';
import { PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { TablePage } from '@admin/pages';
import { Response } from 'express';

@Controller('kashiwa/reports')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly logger: PinoLogger
  ) {}

  @Get()
  @UseGuards(SessionGuard)
  @Render('admin/common_table_page')
  public async getReportsList(
    @Query(new ValidationPipe({ transform: true })) page: PageRequest,
    @Session() session: ISession
  ): Promise<TablePage> {
    this.logger.debug({ page, session }, 'URL called: GET /kashiwa/reports');

    return await this.reportService.findAll(session, page);
  }

  @Post('delete/:reportId')
  @UseGuards(SessionGuard)
  public async deleteReport(@Param('reportId', ParseUUIDPipe) reportId: string, @Res() res: Response): Promise<void> {
    this.logger.debug(`URL called: GET /kashiwa/reports/delete/${reportId}`);

    await this.reportService.remove(reportId, res);
  }
}
