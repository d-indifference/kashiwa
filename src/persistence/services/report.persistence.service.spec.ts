import { ReportPersistenceService } from './report.persistence.service';
import { PrismaService } from '@persistence/lib';
import { PinoLogger } from 'nestjs-pino';
import { ReportMapper } from '@persistence/mappers';
import { ReportCreateDto, ReportDto } from '@persistence/dto/report';

describe('ReportPersistenceService', () => {
  let service: ReportPersistenceService;
  let prisma: jest.Mocked<PrismaService>;
  let logger: jest.Mocked<PinoLogger>;
  let mapper: jest.Mocked<ReportMapper>;

  beforeEach(() => {
    prisma = {
      report: {
        count: jest.fn(),
        createMany: jest.fn(),
        delete: jest.fn()
      },
      $queryRaw: jest.fn()
    } as any;

    logger = {
      setContext: jest.fn(),
      debug: jest.fn(),
      info: jest.fn()
    } as any;

    mapper = {
      toDto: jest.fn()
    } as any;

    service = new ReportPersistenceService(prisma, logger, mapper);
  });

  it('should check if reports exist', async () => {
    prisma.report.count = jest.fn().mockResolvedValue(3);

    const result = await service.checkReportsExist();

    expect(result).toBe(true);
    expect(prisma.report.count).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith('checkReportsExist');
  });

  it('should return false if no reports exist', async () => {
    prisma.report.count = jest.fn().mockResolvedValue(0);

    const result = await service.checkReportsExist();

    expect(result).toBe(false);
  });

  it('should remove a report successfully', async () => {
    prisma.report.delete = jest.fn().mockResolvedValue({ id: '123' } as any);

    await service.remove('123');

    expect(prisma.report.delete).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(logger.info).toHaveBeenCalledWith({ id: '123' }, '[SUCCESS] remove');
  });

  it('should log skipped removal if report not found', async () => {
    prisma.report.count = jest.fn().mockResolvedValue(null);

    await service.remove('999');

    expect(logger.info).toHaveBeenCalledWith({ id: '999' }, '[SKIPPED], report was not found, deletion was skipped');
  });

  it('should create reports for eligible comments', async () => {
    const dto: ReportCreateDto = { boardUrl: 'board', nums: [1n, 2n], reportType: 'COMMENT' };

    jest.spyOn(service as any, 'checkForCreationPossibility').mockResolvedValue(['c1', 'c2']);
    prisma.report.createMany = jest.fn().mockResolvedValue({ count: 2 } as any);

    await service.create(dto);

    expect(prisma.report.createMany).toHaveBeenCalledWith({
      data: [
        { commentId: 'c1', reportType: 'COMMENT' },
        { commentId: 'c2', reportType: 'COMMENT' }
      ]
    });

    expect(logger.info).toHaveBeenCalledWith({ dto }, 'create');
    expect(logger.info).toHaveBeenCalledWith({ batch: { count: 2 } }, '[SUCCESS] create');
  });

  it('should map entities to DTOs in findAll', async () => {
    const pageRequest = { page: 1, limit: 10 };
    const mockEntities = [{ id: 'r1' }, { id: 'r2' }] as any;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pageModule = require('@persistence/lib/page');
    jest.spyOn(pageModule.Page, 'ofFilter').mockResolvedValue({
      map: (fn: any) => mockEntities.map(fn)
    });

    mapper.toDto.mockImplementation(entity => ({ id: entity.id }) as ReportDto);

    const result = await service.findAll(pageRequest as any);

    expect(result).toEqual([{ id: 'r1' }, { id: 'r2' }]);
    expect(logger.debug).toHaveBeenCalledWith({ page: pageRequest }, 'findAll');
  });
});
