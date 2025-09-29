import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { LOCALE } from '@locale/locale';
import { Page, PageRequest } from '@persistence/lib/page';
import { BoardDto } from '@persistence/dto/board';
import { CommentDto } from '@persistence/dto/comment/common';
import { PinoLogger } from 'nestjs-pino';

describe('CatalogService', () => {
  let service: CatalogService;
  let boardPersistenceService: jest.Mocked<BoardPersistenceService>;
  let commentPersistenceService: jest.Mocked<CommentPersistenceService>;
  let loggerService: jest.Mocked<PinoLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: BoardPersistenceService,
          useValue: {
            findByUrl: jest.fn()
          }
        },
        {
          provide: CommentPersistenceService,
          useValue: {
            findManyForCatalog: jest.fn()
          }
        },
        {
          provide: PinoLogger,
          useValue: {
            setContext: jest.fn(),
            debug: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    boardPersistenceService = module.get(BoardPersistenceService);
    commentPersistenceService = module.get(CommentPersistenceService);
    loggerService = module.get(PinoLogger);
  });

  it('should return catalog page with correct data', async () => {
    const mockBoard = { id: 1, url: 'test-board', name: 'Test Board' } as unknown as BoardDto;
    const mockCommentsPage = { content: [{ id: 1, text: 'Comment' }], total: 1 } as unknown as Page<CommentDto>;

    boardPersistenceService.findByUrl.mockResolvedValue(mockBoard);
    commentPersistenceService.findManyForCatalog.mockResolvedValue(mockCommentsPage);

    const pageRequest: PageRequest = { page: 1, limit: 10 };
    const result = await service.getCatalogPage('test-board', 'createdAt', pageRequest);

    expect(boardPersistenceService.findByUrl).toHaveBeenCalledWith('test-board');
    expect(commentPersistenceService.findManyForCatalog).toHaveBeenCalledWith('test-board', 'createdAt', pageRequest);

    expect(result).toEqual({
      orderBy: 'createdAt',
      board: mockBoard,
      page: mockCommentsPage,
      commons: {
        pageTitle: `${LOCALE.CATALOG as string} | ${mockBoard.name}`,
        pageSubtitle: LOCALE.CATALOG
      }
    });
  });
});
