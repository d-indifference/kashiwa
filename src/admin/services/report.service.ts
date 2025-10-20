import { Injectable } from '@nestjs/common';
import { ReportPersistenceService } from '@persistence/services';
import { PinoLogger } from 'nestjs-pino';
import { TableConstructor } from '@admin/lib';
import { ReportDto } from '@persistence/dto/report';
import { reportTableConstructor } from '@admin/misc';
import { ISession } from '@admin/interfaces';
import { PageRequest } from '@persistence/lib/page';
import { TablePage } from '@admin/pages';
import { Response } from 'express';
import { LOCALE } from '@locale/locale';

/**
 * Service responsible for managing report-related operations within the admin module, including listing and deleting reports
 */
@Injectable()
export class ReportService {
  private readonly reportTableConstructor: TableConstructor<ReportDto>;

  constructor(
    private readonly reportPersistenceService: ReportPersistenceService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(ReportService.name);
    this.reportTableConstructor = reportTableConstructor;
  }

  /**
   * Retrieves all reports and converts them into a paginated table representation for admin interface rendering
   * @param session The current admin session
   * @param page Pagination and sorting parameters
   */
  public async findAll(session: ISession, page: PageRequest): Promise<TablePage> {
    this.logger.debug({ session, page }, 'findAll');

    const content = await this.reportPersistenceService.findAll(page);

    const table = this.reportTableConstructor.fromPage(content, '/kashiwa/reports', true);

    return new TablePage(table, session, {
      pageTitle: LOCALE.REPORTS as string,
      pageSubtitle: LOCALE.REPORTS_EXPLANATION as string
    });
  }

  /**
   * Deletes a report by ID and redirects the user to the reports page
   * @param id The unique identifier of the report to remove
   * @param res Express response object used for redirection
   */
  public async remove(id: string, res: Response): Promise<void> {
    this.logger.info({ id }, 'remove');

    await this.reportPersistenceService.remove(id);

    res.redirect('/kashiwa/reports');
  }
}
