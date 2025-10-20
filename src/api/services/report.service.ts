import { Injectable } from '@nestjs/common';
import { ReportPersistenceService } from '@persistence/services';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportPersistenceService: ReportPersistenceService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(ReportService.name);
  }

  public async checkReportsExist(): Promise<boolean> {
    this.logger.debug('checkReportsExist');

    return await this.reportPersistenceService.checkReportsExist();
  }
}
