import { Controller, Get, HttpStatus, ParseUUIDPipe, Query, UseFilters } from '@nestjs/common';
import { RestExceptionFilter } from '@api/filters';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorDto } from '@api/dto/v1';
import { ReportService } from '@api/services';
import { PinoLogger } from 'nestjs-pino';
import { ProtectApiProvider } from '@api/providers';

@Controller('api/v1/reports')
@UseFilters(RestExceptionFilter)
@ApiTags('Reports information')
@ApiResponse({ type: ErrorDto, description: 'Internal server error', status: HttpStatus.INTERNAL_SERVER_ERROR })
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly protectApiProvider: ProtectApiProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(ReportController.name);
  }

  @Get('exists')
  @ApiOperation({ summary: 'Check for the existence of current unprocessed reports' })
  @ApiQuery({
    name: 'userId',
    type: String,
    description: 'Moderator or administrator user ID',
    example: '40cb1f6c-2ad0-4c0d-8363-2d0bd235ebdc',
    required: true,
    nullable: false
  })
  @ApiResponse({
    type: Boolean,
    description: 'If the value is "true", then there are unprocessed reports in the database, otherwise it is "false"',
    status: HttpStatus.OK,
    example: false
  })
  public async checkReportsExist(@Query('userId', ParseUUIDPipe) userId: string): Promise<boolean> {
    this.logger.debug('URL called: /api/v1/reports/exists');
    await this.protectApiProvider.protect(userId);

    return await this.reportService.checkReportsExist();
  }
}
