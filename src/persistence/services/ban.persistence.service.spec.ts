import { BanPersistenceService } from './ban.persistence.service';
import { PageRequest } from '@persistence/lib/page';

const prismaMock = {
  ban: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn()
  }
};
const banMapperMock = {
  toDto: jest.fn(),
  create: jest.fn()
};
const loggerMock = {
  setContext: jest.fn(),
  info: jest.fn()
};
const PageMock = {
  ofFilter: jest.fn()
};
jest.mock('@persistence/lib/page', () => ({
  Page: {
    ofFilter: jest.fn()
  }
}));

describe('BanPersistenceService', () => {
  let service: BanPersistenceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BanPersistenceService(prismaMock as any, banMapperMock as any, loggerMock as any);
  });

  it('should be defined and set logger context', () => {
    expect(service).toBeDefined();
    expect(loggerMock.setContext).toHaveBeenCalledWith('BanPersistenceService');
  });

  describe('findAll', () => {
    it('should return mapped bans from Page.ofFilter', async () => {
      const pageRequest: PageRequest = { page: 1, limit: 10 };
      const entities = [
        { id: 'banid1', user: { id: 'user1' } },
        { id: 'banid2', user: { id: 'user2' } }
      ];
      const dtos = [{ banId: 'banid1' }, { banId: 'banid2' }];
      PageMock.ofFilter.mockResolvedValueOnce(entities);
      banMapperMock.toDto.mockReturnValueOnce(dtos[0]).mockReturnValueOnce(dtos[1]);

      // Импортируем mock Page.ofFilter (через require)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Page } = require('@persistence/lib/page');
      Page.ofFilter.mockResolvedValueOnce(entities);

      const result = await service.findAll(pageRequest);
      expect(Page.ofFilter).toHaveBeenCalledWith(
        prismaMock,
        'ban',
        pageRequest,
        {},
        { createdAt: 'desc' },
        { user: true, board: true }
      );
      expect(banMapperMock.toDto).toHaveBeenCalledWith(entities[0], entities[0]['user']);
      expect(banMapperMock.toDto).toHaveBeenCalledWith(entities[1], entities[1]['user']);
      expect(result).toEqual(dtos);
    });
  });

  describe('getCurrentBan', () => {
    it('should return null if no ban found', async () => {
      prismaMock.ban.findFirst.mockResolvedValueOnce(null);
      const result = await service.getCurrentBan('1.2.3.4');
      expect(prismaMock.ban.findFirst).toHaveBeenCalledWith({
        where: { ip: '1.2.3.4' },
        orderBy: { createdAt: 'desc' },
        include: { user: true, board: true }
      });
      expect(result).toBeNull();
    });

    it('should return mapped ban if till > now', async () => {
      const banEntity = { till: new Date(Date.now() + 100000), user: { id: 'u' } };
      prismaMock.ban.findFirst.mockResolvedValueOnce(banEntity);
      banMapperMock.toDto.mockReturnValueOnce({ ban: 'dto' });

      const result = await service.getCurrentBan('8.8.8.8');
      expect(result).toEqual({ ban: 'dto' });
      expect(banMapperMock.toDto).toHaveBeenCalledWith(banEntity, banEntity.user);
    });

    it('should call deleteOldBans and return null if till < now', async () => {
      const banEntity = { till: new Date(Date.now() - 100000), user: { id: 'u' } };
      prismaMock.ban.findFirst.mockResolvedValueOnce(banEntity);

      const spy = jest.spyOn(service, 'deleteOldBans').mockResolvedValueOnce();
      const result = await service.getCurrentBan('8.8.8.8');
      expect(spy).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create ban, delete old bans and return mapped dto', async () => {
      const userId = 'admin1';
      const dto = { ip: '1.2.3.4' };
      banMapperMock.create.mockReturnValueOnce({ ip: '1.2.3.4', till: new Date() });
      const created = { id: 'banid', user: { id: 'u' } };
      prismaMock.ban.create.mockResolvedValueOnce(created);
      banMapperMock.toDto.mockReturnValueOnce({ ban: 'dto' });

      const spyDeleteOldBans = jest.spyOn(service, 'deleteOldBans').mockResolvedValueOnce();
      const result = await service.create(userId, dto as any);

      expect(loggerMock.info).toHaveBeenCalledWith({ userId, dto }, 'create');
      expect(banMapperMock.create).toHaveBeenCalledWith(userId, dto);
      expect(prismaMock.ban.create).toHaveBeenCalledWith({
        data: { ip: '1.2.3.4', till: expect.any(Date) },
        include: { user: true, board: true }
      });
      expect(spyDeleteOldBans).toHaveBeenCalled();
      expect(banMapperMock.toDto).toHaveBeenCalledWith(created, created.user);
      expect(result).toEqual({ ban: 'dto' });
    });
  });

  describe('remove', () => {
    it('should delete ban, delete old bans and log success', async () => {
      const batch = { id: 'banid' };
      prismaMock.ban.delete.mockResolvedValueOnce(batch);
      const spyDeleteOldBans = jest.spyOn(service, 'deleteOldBans').mockResolvedValueOnce();

      await service.remove('banid');
      expect(loggerMock.info).toHaveBeenCalledWith({ id: 'banid' }, 'remove');
      expect(prismaMock.ban.delete).toHaveBeenCalledWith({ where: { id: 'banid' } });
      expect(spyDeleteOldBans).toHaveBeenCalled();
      expect(loggerMock.info).toHaveBeenCalledWith({ id: batch.id }, '[SUCCESS] remove');
    });
  });

  describe('deleteOldBans', () => {
    it('should delete many bans and log success', async () => {
      prismaMock.ban.deleteMany.mockResolvedValueOnce({ count: 5 });
      await service.deleteOldBans();
      expect(loggerMock.info).toHaveBeenCalledWith('deleteOldBans');
      expect(prismaMock.ban.deleteMany).toHaveBeenCalledWith({ where: { till: { lt: expect.any(Date) } } });
      expect(loggerMock.info).toHaveBeenCalledWith({ count: 5 }, '[SUCCESS] deleteOldBans');
    });
  });
});
