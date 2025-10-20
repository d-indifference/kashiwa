import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { ReportPersistenceService } from '@persistence/services';
import { PinoLogger } from 'nestjs-pino';
import { TableConstructor } from '@admin/lib';
import { ReportDto } from '@persistence/dto/report';
import { TablePage } from '@admin/pages';
import { Response } from 'express';
import { PageRequest } from '@persistence/lib/page';
import { UserRole } from '@prisma/client';

jest.mock('@admin/misc', () => ({
  reportTableConstructor: {
    fromPage: jest.fn()
  }
}));

describe('ReportService', () => {
  let service: ReportService;
  let reportPersistenceService: jest.Mocked<ReportPersistenceService>;
  let logger: jest.Mocked<PinoLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: ReportPersistenceService,
          useValue: {
            findAll: jest.fn(),
            remove: jest.fn()
          }
        },
        {
          provide: PinoLogger,
          useValue: {
            setContext: jest.fn(),
            debug: jest.fn(),
            info: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get(ReportService);
    reportPersistenceService = module.get(ReportPersistenceService);
    logger = module.get(PinoLogger);
  });

  describe('findAll', () => {
    it('should retrieve all reports and construct a TablePage', async () => {
      const mockPageRequest = new PageRequest(1, 10);
      const mockSession = { payload: { id: '000-abc', role: UserRole.ADMINISTRATOR } } as any;
      const mockContent = { items: [{ id: '1' }], total: 1 } as any;

      reportPersistenceService.findAll.mockResolvedValue(mockContent);

      const fromPage = jest.fn().mockReturnValue('<table>mockTable</table>');
      (service as any).reportTableConstructor = { fromPage } as unknown as TableConstructor<ReportDto>;

      const result = await service.findAll(mockSession, mockPageRequest);

      expect(reportPersistenceService.findAll).toHaveBeenCalledWith(mockPageRequest);
      expect(fromPage).toHaveBeenCalledWith(mockContent, '/kashiwa/reports', true);
      expect(result).toBeInstanceOf(TablePage);
      expect(result.tableHtml).toBe('<table>mockTable</table>');
      expect(result.commons.pageTitle).toBe('Reports');
      expect(result.commons.pageSubtitle).toBe('Please review all current reports');
      expect(result.session).toBe(mockSession);
    });
  });

  describe('remove', () => {
    it('should call persistence remove and redirect to /kashiwa/reports', async () => {
      const mockResponse = { redirect: jest.fn() } as unknown as Response;
      const mockId = '123';

      await service.remove(mockId, mockResponse);

      expect(logger.info).toHaveBeenCalledWith({ id: mockId }, 'remove');
      expect(reportPersistenceService.remove).toHaveBeenCalledWith(mockId);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/kashiwa/reports');
    });
  });
});
