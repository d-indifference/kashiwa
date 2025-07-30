import { AttachedFilePersistenceService } from './attached-file.persistence.service';

const prismaMock = {
  attachedFile: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn()
  },
  comment: {
    findFirst: jest.fn()
  },
  $transaction: jest.fn()
};

const fileSystemMock = {
  removePath: jest.fn()
};

const loggerMock = {
  setContext: jest.fn(),
  info: jest.fn()
};

const Constants = {
  SRC_DIR: 'src',
  THUMB_DIR: 'thumb'
};

describe('AttachedFilePersistenceService', () => {
  let service: AttachedFilePersistenceService;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async fn => fn(prismaMock));
    service = new AttachedFilePersistenceService(prismaMock as any, fileSystemMock as any, loggerMock as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(loggerMock.setContext).toHaveBeenCalledWith('AttachedFilePersistenceService');
  });

  describe('findFileByMd5', () => {
    it('should return entity if found', async () => {
      const entity = { id: 1, md5: 'abc', comments: [] };
      prismaMock.attachedFile.findFirst.mockResolvedValueOnce(entity);
      const result = await service.findFileByMd5('abc', 'b');
      expect(prismaMock.attachedFile.findFirst).toHaveBeenCalledWith({
        where: { md5: 'abc', comments: { every: { board: { url: 'b' } } } },
        include: { comments: { include: { board: true } } }
      });
      expect(result).toBe(entity);
    });

    it('should return null if not found', async () => {
      prismaMock.attachedFile.findFirst.mockResolvedValueOnce(null);
      const result = await service.findFileByMd5('def', 'board');
      expect(result).toBeNull();
    });
  });

  describe('clearByPassword', () => {
    it('should update files and remove paths then log success', async () => {
      const candidates = [
        { id: 1, name: 'f1', thumbnail: 't1' },
        { id: 2, name: 'f2', thumbnail: null }
      ];
      prismaMock.attachedFile.findMany.mockResolvedValueOnce(candidates);
      prismaMock.attachedFile.updateMany.mockResolvedValueOnce({ count: 2 });
      fileSystemMock.removePath.mockResolvedValue(undefined);

      await service.clearByPassword('board', [1n, 2n], 'pass');

      expect(prismaMock.attachedFile.findMany).toHaveBeenCalledWith({
        where: { comments: { some: { board: { url: 'board' }, num: { in: [1n, 2n] }, password: 'pass' } } },
        select: { id: true, name: true, thumbnail: true }
      });
      expect(prismaMock.attachedFile.updateMany).toHaveBeenCalledWith({
        data: { name: 'NO_THUMB', thumbnail: null },
        where: { id: { in: [1, 2] } }
      });
      expect(fileSystemMock.removePath).toHaveBeenCalledWith(['board', Constants.SRC_DIR, 'f1']);
      expect(fileSystemMock.removePath).toHaveBeenCalledWith(['board', Constants.THUMB_DIR, 't1']);
      expect(fileSystemMock.removePath).toHaveBeenCalledWith(['board', Constants.SRC_DIR, 'f2']);
      expect(fileSystemMock.removePath).toHaveBeenCalledWith(['board', Constants.THUMB_DIR, '0']);
      expect(loggerMock.info).toHaveBeenCalledWith({ count: 2 }, '[SUCCESS] clearByPassword');
    });
  });

  describe('clearFromComment', () => {
    it('should update attachedFile, remove paths and log if comment found', async () => {
      const comment = {
        attachedFile: {
          id: 123,
          name: 'file.jpg',
          thumbnail: 'thumb.jpg'
        }
      };
      prismaMock.comment.findFirst.mockResolvedValueOnce(comment);
      prismaMock.attachedFile.update.mockResolvedValueOnce({ id: 123 });
      fileSystemMock.removePath.mockResolvedValue(undefined);

      await service.clearFromComment('board', 999n);

      expect(prismaMock.comment.findFirst).toHaveBeenCalledWith({
        where: { board: { url: 'board' }, num: 999n, NOT: { attachedFile: null } },
        include: { attachedFile: true }
      });
      expect(prismaMock.attachedFile.update).toHaveBeenCalledWith({
        where: { id: 123 },
        data: { name: 'NO_THUMB', thumbnail: null }
      });
      expect(fileSystemMock.removePath).toHaveBeenCalledWith(['board', Constants.SRC_DIR, 'file.jpg']);
      expect(fileSystemMock.removePath).toHaveBeenCalledWith(['board', Constants.THUMB_DIR, 'thumb.jpg']);
      expect(loggerMock.info).toHaveBeenCalledWith({ id: 123 }, '[SUCCESS] clearFromComment');
    });

    it('should do nothing if comment not found', async () => {
      prismaMock.comment.findFirst.mockResolvedValueOnce(null);

      await service.clearFromComment('board', 100n);

      expect(prismaMock.attachedFile.update).not.toHaveBeenCalled();
      expect(fileSystemMock.removePath).not.toHaveBeenCalled();
      expect(loggerMock.info).not.toHaveBeenCalledWith(expect.anything(), '[SUCCESS] clearFromComment');
    });
  });

  describe('removeOrphaned', () => {
    it('should remove orphaned files and log success', async () => {
      const orphaned = [
        { id: 1, name: 'f1', thumbnail: 't1' },
        { id: 2, name: 'f2', thumbnail: null }
      ];
      prismaMock.attachedFile.findMany.mockResolvedValueOnce(orphaned);
      prismaMock.attachedFile.deleteMany.mockResolvedValueOnce({ count: 2 });
      fileSystemMock.removePath.mockResolvedValue(undefined);

      await service.removeOrphaned('board');

      expect(prismaMock.attachedFile.findMany).toHaveBeenCalledWith({
        where: { comments: { none: {} }, board: { url: 'board' } }
      });
      expect(fileSystemMock.removePath).toHaveBeenCalledWith(['board', Constants.SRC_DIR, 'f1']);
      expect(fileSystemMock.removePath).toHaveBeenCalledWith(['board', Constants.THUMB_DIR, 't1']);
      expect(fileSystemMock.removePath).toHaveBeenCalledWith(['board', Constants.SRC_DIR, 'f2']);
      expect(fileSystemMock.removePath).toHaveBeenCalledWith(['board', Constants.THUMB_DIR, '0']);
      expect(prismaMock.attachedFile.deleteMany).toHaveBeenCalledWith({ where: { id: { in: [1, 2] } } });
      expect(loggerMock.info).toHaveBeenCalledWith({ count: 2 }, '[SUCCESS] removeOrphaned');
    });
  });
});
