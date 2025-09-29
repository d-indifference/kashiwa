import { BoardPersistenceService } from './board.persistence.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Page } from '@persistence/lib/page';
import { BoardShortDto } from '@persistence/dto/board';
import { Board } from '@prisma/client';

const prismaMock = {
  board: {
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  comment: {
    deleteMany: jest.fn()
  }
};
const boardMapperMock = {
  toShortDto: jest.fn(),
  toDto: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};
const loggerMock = {
  setContext: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};
const attachedFilePersistenceServiceMock = {
  removeOrphaned: jest.fn()
};
const PageMock = {
  of: jest.fn()
};
jest.mock('@persistence/lib/page', () => ({
  Page: {
    of: jest.fn()
  }
}));
const Constants = {
  RESERVED_BOARD_URLS: ['admin', 'api']
};

const LOCALE = {
  BOARD_WITH_ID_NOT_FOUND: (id: string) => `Board with id ${id} not found`,
  BOARD_BY_URL_NOT_FOUND: (url: string) => `Board with url ${url} not found`,
  BOARD_SETTINGS_BY_URL_NOT_FOUND: (url: string) => `Board settings by url ${url} not found`,
  URL_IS_RESERVED: (url: string) => `URL "${url}" is reserved`,
  BOARD_ALREADY_EXISTS: (url: string) => `Board with url "${url}" already exists`
};

describe('BoardPersistenceService', () => {
  let service: BoardPersistenceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BoardPersistenceService(
      prismaMock as any,
      boardMapperMock as any,
      loggerMock as any,
      attachedFilePersistenceServiceMock as any
    );
  });

  it('should be defined and set logger context', () => {
    expect(service).toBeDefined();
    expect(loggerMock.setContext).toHaveBeenCalledWith('BoardPersistenceService');
  });

  describe('findAll', () => {
    it('should return mapped short board DTOs', async () => {
      const boards = [{ id: '1' }, { id: '2' }];
      const dtos = [{ short: 1 }, { short: 2 }];
      PageMock.of.mockResolvedValueOnce(boards);
      boardMapperMock.toShortDto.mockImplementation(board => ({ short: board.id }));

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Page } = require('@persistence/lib/page');
      Page.of.mockResolvedValueOnce(boards);

      const result: Page<BoardShortDto> = await service.findAll({ page: 1, limit: 10 });
      expect(Page.of).toHaveBeenCalledWith(prismaMock, 'board', { page: 1, limit: 10 });
      expect(result).toEqual([{ short: '1' }, { short: '2' }]);
    });
  });

  describe('findById', () => {
    it('should throw if board not found', async () => {
      prismaMock.board.findFirst.mockResolvedValueOnce(null);
      await expect(service.findById('id1')).rejects.toThrow(NotFoundException);
    });

    it('should return board if found', async () => {
      const board = { id: 'id1', boardSettings: {} };
      prismaMock.board.findFirst.mockResolvedValueOnce(board);
      const result = await service.findById('id1');
      expect(result).toBe(board);
    });
  });

  describe('findDtoById', () => {
    it('should return BoardDto if found', async () => {
      const board = { id: 'id2', boardSettings: {} };
      prismaMock.board.findFirst.mockResolvedValueOnce(board);
      boardMapperMock.toDto.mockReturnValueOnce({ dto: true });

      const result = await service.findDtoById('id2');
      expect(result).toEqual({ dto: true });
      expect(boardMapperMock.toDto).toHaveBeenCalledWith(board, board.boardSettings);
    });
  });

  describe('findShortDtoById', () => {
    it('should return BoardShortDto if found', async () => {
      const board = { id: 'id3', boardSettings: {} };
      prismaMock.board.findFirst.mockResolvedValueOnce(board);
      boardMapperMock.toShortDto.mockReturnValueOnce({ short: true });

      const result = await service.findShortDtoById('id3');
      expect(result).toEqual({ short: true });
      expect(boardMapperMock.toShortDto).toHaveBeenCalledWith(board);
    });
  });

  describe('findByUrl', () => {
    it('should throw if board not found', async () => {
      prismaMock.board.findFirst.mockResolvedValueOnce(null);
      await expect(service.findByUrl('url1')).rejects.toThrow(NotFoundException);
    });

    it('should throw if boardSettings not found', async () => {
      prismaMock.board.findFirst.mockResolvedValueOnce({ id: 'id', boardSettings: undefined });
      await expect(service.findByUrl('url2')).rejects.toThrow(NotFoundException);
    });

    it('should return BoardDto if found', async () => {
      const board = { id: 'id', boardSettings: { foo: 'bar' } };
      prismaMock.board.findFirst.mockResolvedValueOnce(board);
      boardMapperMock.toDto.mockReturnValueOnce({ dto: true });

      const result = await service.findByUrl('url3');
      expect(result).toEqual({ dto: true });
      expect(boardMapperMock.toDto).toHaveBeenCalledWith(board, board.boardSettings);
    });
  });

  describe('countAll', () => {
    it('should return board count', async () => {
      prismaMock.board.count.mockResolvedValueOnce(42);
      const result = await service.countAll();
      expect(result).toBe(42);
      expect(prismaMock.board.count).toHaveBeenCalled();
    });
  });

  describe('getCurrentPostCount', () => {
    it('should throw if board not found', async () => {
      prismaMock.board.findFirst.mockResolvedValueOnce(null);
      await expect(service.getCurrentPostCount('url')).rejects.toThrow(NotFoundException);
    });

    it('should return postCount if found', async () => {
      prismaMock.board.findFirst.mockResolvedValueOnce({ postCount: 5 });
      const result = await service.getCurrentPostCount('url');
      expect(result).toBe(5);
    });
  });

  describe('create', () => {
    it('should checkOnCreate, create board and return BoardDto', async () => {
      const dto = { url: 'board1' };
      jest.spyOn(service as any, 'checkOnCreate').mockResolvedValueOnce(undefined);
      boardMapperMock.create.mockReturnValueOnce({ url: 'board1' });
      const createdBoard = { id: 'id', boardSettings: { foo: 'bar' } };
      prismaMock.board.create.mockResolvedValueOnce(createdBoard);
      boardMapperMock.toDto.mockReturnValueOnce({ dto: true });

      const result = await service.create(dto as any);

      expect(loggerMock.info).toHaveBeenCalledWith(dto, 'create');
      expect(boardMapperMock.create).toHaveBeenCalledWith(dto);
      expect(prismaMock.board.create).toHaveBeenCalledWith({
        data: { url: 'board1' },
        include: { boardSettings: true }
      });
      expect(result).toEqual({ dto: true });
    });
  });

  describe('update', () => {
    it('should checkOnUpdate, update board and return BoardDto', async () => {
      const dto = { id: 'id', url: 'board2' };
      jest.spyOn(service as any, 'checkOnUpdate').mockResolvedValueOnce(undefined);
      boardMapperMock.update.mockReturnValueOnce({ url: 'board2' });
      const updatedBoard = { id: 'id', boardSettings: { foo: 'bar' } };
      prismaMock.board.update.mockResolvedValueOnce(updatedBoard);
      boardMapperMock.toDto.mockReturnValueOnce({ dto: true });

      const result = await service.update(dto as any);

      expect(loggerMock.info).toHaveBeenCalledWith(dto, 'update');
      expect(boardMapperMock.update).toHaveBeenCalledWith(dto);
      expect(prismaMock.board.update).toHaveBeenCalledWith({
        where: { id: 'id' },
        data: { url: 'board2' },
        include: { boardSettings: true }
      });
      expect(result).toEqual({ dto: true });
    });
  });

  describe('nullifyPostCount', () => {
    it('should update board postCount to 0', async () => {
      prismaMock.board.update.mockResolvedValueOnce({});
      await service.nullifyPostCount('id');
      expect(loggerMock.info).toHaveBeenCalledWith({ id: 'id' }, 'nullifyPostCount');
      expect(prismaMock.board.update).toHaveBeenCalledWith({ data: { postCount: 0 }, where: { id: 'id' } });
    });
  });

  describe('incrementPostCount', () => {
    it('should increment board postCount and log success', async () => {
      // mock private method
      jest.spyOn(service as any, 'findByUrlNoMapping').mockResolvedValueOnce({ id: 'id', postCount: 7 });
      prismaMock.board.update.mockResolvedValueOnce({ id: 'id' });

      await service.incrementPostCount('url');
      expect(loggerMock.info).toHaveBeenCalledWith({ url: 'url' }, 'incrementPostCount');
      expect(prismaMock.board.update).toHaveBeenCalledWith({ data: { postCount: 8 }, where: { id: 'id' } });
      expect(loggerMock.info).toHaveBeenCalledWith({ id: 'id' }, '[SUCCESS] incrementPostCount');
    });
  });

  describe('remove', () => {
    it('should remove board with comments and orphaned files', async () => {
      const board = { id: 'id', url: 'url' };
      jest.spyOn(service, 'findById').mockResolvedValueOnce(board as Board);
      prismaMock.comment.deleteMany.mockResolvedValueOnce({});
      attachedFilePersistenceServiceMock.removeOrphaned.mockResolvedValueOnce({});
      prismaMock.board.delete.mockResolvedValueOnce({});

      await service.remove('id');
      expect(loggerMock.info).toHaveBeenCalledWith({ id: 'id' }, 'remove');
      expect(prismaMock.comment.deleteMany).toHaveBeenCalledWith({ where: { boardId: 'id' } });
      expect(attachedFilePersistenceServiceMock.removeOrphaned).toHaveBeenCalledWith('url');
      expect(prismaMock.board.delete).toHaveBeenCalledWith({ where: { id: 'id' }, include: { boardSettings: true } });
    });
  });

  describe('checkOnCreate', () => {
    it('should throw if url is reserved', async () => {
      const dto = { url: 'kashiwa' };
      await expect((service as any).checkOnCreate(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if board with url exists', async () => {
      const dto = { url: 'test' };
      prismaMock.board.findFirst.mockResolvedValueOnce({ id: 'existing' });
      await expect((service as any).checkOnCreate(dto)).rejects.toThrow(BadRequestException);
    });

    it('should resolve if url is not reserved and board does not exist', async () => {
      const dto = { url: 'free' };
      prismaMock.board.findFirst.mockResolvedValueOnce(null);
      await expect((service as any).checkOnCreate(dto)).resolves.toBeUndefined();
    });
  });

  describe('checkOnUpdate', () => {
    it('should throw if url is reserved (update)', async () => {
      const dto = { id: 'id', url: 'kashiwa' };
      jest.spyOn(service, 'findById').mockResolvedValueOnce({ id: 'id', url: 'kashiwa' } as Board);
      await expect((service as any).checkOnUpdate(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if board with url exists and id mismatch', async () => {
      const dto = { id: 'main', url: 'test' };
      jest.spyOn(service, 'findById').mockResolvedValueOnce({ id: 'other' } as Board);
      prismaMock.board.findFirst.mockResolvedValueOnce({ id: 'other' });
      await expect((service as any).checkOnUpdate(dto)).rejects.toThrow(BadRequestException);
    });

    it('should resolve if url is not reserved and board does not exist or id matches', async () => {
      const dto = { id: 'main', url: 'free' };
      jest.spyOn(service, 'findById').mockResolvedValueOnce({ id: 'main', url: 'free' } as Board);
      prismaMock.board.findFirst.mockResolvedValueOnce({ id: 'main' });
      await expect((service as any).checkOnUpdate(dto)).resolves.toBeUndefined();
    });
  });

  describe('findByUrlNoMapping', () => {
    it('should throw if board not found', async () => {
      prismaMock.board.findFirst.mockResolvedValueOnce(null);
      await expect((service as any).findByUrlNoMapping('url')).rejects.toThrow(NotFoundException);
    });

    it('should return board model if found', async () => {
      const board = { id: 'id', url: 'url' };
      prismaMock.board.findFirst.mockResolvedValueOnce(board);
      const result = await (service as any).findByUrlNoMapping('url');
      expect(result).toBe(board);
    });
  });
});
