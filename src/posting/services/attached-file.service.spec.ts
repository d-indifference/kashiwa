import { AttachedFileService } from './attached-file.service';
import { MemoryStoredFile } from 'nestjs-form-data';

describe('AttachedFileService', () => {
  let attachedFilePersistenceServiceMock: any;
  let boardPersistenceServiceMock: any;
  let formFileProviderMock: any;
  let service: AttachedFileService;

  beforeEach(() => {
    attachedFilePersistenceServiceMock = {
      findFileByMd5: jest.fn()
    };
    boardPersistenceServiceMock = {
      findByUrl: jest.fn()
    };
    formFileProviderMock = {
      md5: jest.fn(),
      saveFile: jest.fn()
    };

    service = new AttachedFileService(
      attachedFilePersistenceServiceMock,
      boardPersistenceServiceMock,
      formFileProviderMock
    );
  });

  it('should return empty object if file is undefined', async () => {
    const result = await service.createAttachedFile(undefined, 'boardUrl');
    expect(result).toEqual({});
  });

  it('should return connect if file with md5 already exists', async () => {
    const file = { buffer: Buffer.from('test') };
    formFileProviderMock.md5.mockReturnValue('md5hash');
    attachedFilePersistenceServiceMock.findFileByMd5.mockResolvedValue({ id: 42 });
    const result = await service.createAttachedFile(file as MemoryStoredFile, 'boardUrl');
    expect(formFileProviderMock.md5).toHaveBeenCalledWith(file);
    expect(attachedFilePersistenceServiceMock.findFileByMd5).toHaveBeenCalledWith('md5hash', 'boardUrl');
    expect(result).toEqual({ attachedFile: { connect: { id: 42 } } });
  });

  it('should create and return attachedFile if not found by md5', async () => {
    const file = { buffer: Buffer.from('other') };
    formFileProviderMock.md5.mockReturnValue('md5other');
    attachedFilePersistenceServiceMock.findFileByMd5.mockResolvedValue(null);
    boardPersistenceServiceMock.findByUrl.mockResolvedValue({ id: 99, url: 'boardUrl' });
    formFileProviderMock.saveFile.mockResolvedValue({ mime: 'image/png', name: 'file.png', md5: 'md5other' });

    const result = await service.createAttachedFile(file as MemoryStoredFile, 'boardUrl');
    expect(formFileProviderMock.md5).toHaveBeenCalledWith(file);
    expect(attachedFilePersistenceServiceMock.findFileByMd5).toHaveBeenCalledWith('md5other', 'boardUrl');
    expect(boardPersistenceServiceMock.findByUrl).toHaveBeenCalledWith('boardUrl');
    expect(formFileProviderMock.saveFile).toHaveBeenCalledWith(file, { id: 99, url: 'boardUrl' }, 'md5other');
    expect(result).toEqual({
      attachedFile: {
        create: { mime: 'image/png', name: 'file.png', md5: 'md5other' }
      }
    });
  });
});
