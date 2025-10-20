import { Injectable } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { PinoLogger } from 'nestjs-pino';
import { Page, PageRequest } from '@persistence/lib/page';
import { ReportCreateDto, ReportDto } from '@persistence/dto/report';
import { Prisma, Report } from '@prisma/client';
import { ReportMapper } from '@persistence/mappers';

/**
 * Persistence service responsible for managing `Report` entities in the database.
 */
@Injectable()
export class ReportPersistenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger,
    private readonly reportMapper: ReportMapper
  ) {
    this.logger.setContext(ReportPersistenceService.name);
  }

  /**
   * Checks whether there are any reports in the database
   */
  public async checkReportsExist(): Promise<boolean> {
    this.logger.debug('checkReportsExist');

    return (await this.prisma.report.count()) > 0;
  }

  /**
   * Retrieves a paginated list of reports with related comment and board data
   * @param page Pagination and filtering parameters
   */
  public async findAll(page: PageRequest): Promise<Page<ReportDto>> {
    this.logger.debug({ page }, 'findAll');

    const reports = await Page.ofFilter<
      Report,
      Prisma.ReportWhereInput,
      Prisma.ReportOrderByWithAggregationInput[],
      Prisma.ReportInclude
    >(this.prisma, 'report', page, {}, [{ createdAt: 'desc' }], {
      comment: { include: { attachedFile: { include: { board: true } }, parent: true, board: true } }
    });

    return reports.map(entity => this.reportMapper.toDto(entity));
  }

  /**
   * Creates one or more new reports for the specified comments, ensuring that duplicate reports of the same type are not created.
   * @param dto The data transfer object containing report creation parameters
   */
  public async create(dto: ReportCreateDto): Promise<void> {
    this.logger.info({ dto }, 'create');

    const commentIds = await this.checkForCreationPossibility(dto);

    const creationInput: Prisma.ReportCreateManyInput[] = [];

    commentIds.forEach(commentId => {
      creationInput.push({ reportType: dto.reportType, commentId });
    });

    const batch = await this.prisma.report.createMany({ data: creationInput });

    this.logger.info({ batch }, '[SUCCESS] create');
  }

  /**
   * Removes a report from the database by its identifier
   * @param id  The ID of the report to delete
   */
  public async remove(id: string): Promise<void> {
    this.logger.info({ id }, 'remove');

    const result = await this.prisma.report.delete({ where: { id } });

    if (result) {
      this.logger.info({ id: result.id }, '[SUCCESS] remove');
    } else {
      this.logger.info({ id }, '[SKIPPED], report was not found, deletion was skipped');
    }
  }

  /**
   * Checks which comments are eligible for report creation
   */
  private async checkForCreationPossibility(dto: ReportCreateDto): Promise<string[]> {
    const queryResult: { id: string }[] = await this.prisma.$queryRaw(
      Prisma.sql`
          SELECT c.id
          FROM comment AS c
                   JOIN board AS b ON b.id = c.board_id
          WHERE b.url = ${dto.boardUrl}
            AND c.num IN (${Prisma.join(dto.nums)})
            AND NOT EXISTS (
              SELECT 1
              FROM report AS r
              WHERE r.comment_id = c.id
                AND r.report_type = CAST(${dto.reportType} AS "ReportType")
          );`
    );

    return queryResult.map(q => q.id);
  }
}
