import { FormFileProvider } from './form-file.provider';
import * as crypto from 'node:crypto';
import { DateTime } from 'luxon';
import { MemoryStoredFile } from 'nestjs-form-data';
import { BoardDto } from '@persistence/dto/board';
import { ImagemagickStrategy, IMediaFileHandlerStrategy } from '@posting/strategies';
import { Prisma } from '@prisma/client';

describe('FormFileProvider', () => {
  let fileSystem: any;
  let mediaFileHandlerProvider: any;
  let provider: FormFileProvider;

  beforeEach(() => {
    fileSystem = {
      writeBinaryFile: jest.fn()
    };

    mediaFileHandlerProvider = {
      getDimensions: jest.fn(),
      createThumbnail: jest.fn()
    };

    provider = new FormFileProvider(fileSystem, mediaFileHandlerProvider);
    jest.clearAllMocks();
  });

  describe('md5', () => {
    it('should return correct md5 hash for file buffer', () => {
      const file = { buffer: Buffer.from('test-data') };
      const expected = crypto.createHash('md5').update(file.buffer).digest('hex');
      expect(provider.md5(file as MemoryStoredFile)).toBe(expected);
    });
  });

  describe('saveFile', () => {
    const board = { id: 1, url: 'test-board' };
    const baseFile = {
      buffer: Buffer.from('data'),
      size: 123,
      mimeType: 'image/png',
      extension: 'png'
    };

    it('should save non-media file and set mime', async () => {
      const file = { ...baseFile, mimeType: 'application/pdf', extension: 'pdf' };
      jest.spyOn(provider as any, 'isMedia').mockImplementation((f, mp) => false);
      jest.spyOn(provider as any, 'saveFileToSrc').mockResolvedValue(['dest', 'name.pdf']);
      fileSystem.writeBinaryFile.mockResolvedValue(undefined);

      const result = await provider.saveFile(file as MemoryStoredFile, board as unknown as BoardDto, 'md5hash');
      expect(result.isImage).toBe(false);
      expect(result.isVideo).toBe(false);
      expect(result.mime).toBe('application/pdf'); // mime-types.lookup will return "application/pdf"
      expect(result.name).toBe('name.pdf');
      expect(result.size).toBe(123);
      expect(result.md5).toBe('md5hash');
      expect(result.board).toEqual({ connect: { id: board.id } });
    });

    it('should save image file, set dimensions and thumbnail', async () => {
      const file = { ...baseFile, mimeType: 'image/jpeg', extension: 'jpg' };
      jest.spyOn(provider as any, 'isMedia').mockImplementation((f, mp) => mp === 'image');
      jest.spyOn(provider as any, 'saveFileToSrc').mockResolvedValue(['dest', 'name.jpg']);
      fileSystem.writeBinaryFile.mockResolvedValue(undefined);

      mediaFileHandlerProvider.getDimensions.mockResolvedValue({ width: 100, height: 200 });
      mediaFileHandlerProvider.createThumbnail.mockResolvedValue({
        thumbnail: Buffer.from('thumb'),
        thumbnailWidth: 50,
        thumbnailHeight: 60
      });

      const result = await provider.saveFile(file as MemoryStoredFile, board as unknown as BoardDto, 'md5img');
      expect(result.isImage).toBe(true);
      expect(result.isVideo).toBe(false);
      expect(result.width).toBe(100);
      expect(result.height).toBe(200);
      expect(result.thumbnail).toEqual(Buffer.from('thumb'));
      expect(result.thumbnailWidth).toBe(50);
      expect(result.thumbnailHeight).toBe(60);
    });

    it('should save video file, set dimensions and thumbnail', async () => {
      const file = { ...baseFile, mimeType: 'video/mp4', extension: 'mp4' };
      jest.spyOn(provider as any, 'isMedia').mockImplementation((f, mp) => mp === 'video');
      jest.spyOn(provider as any, 'saveFileToSrc').mockResolvedValue(['dest', 'name.mp4']);
      fileSystem.writeBinaryFile.mockResolvedValue(undefined);

      mediaFileHandlerProvider.getDimensions.mockResolvedValue({ width: 300, height: 400 });
      mediaFileHandlerProvider.createThumbnail.mockResolvedValue({
        thumbnail: Buffer.from('thumbv'),
        thumbnailWidth: 150,
        thumbnailHeight: 160
      });

      const result = await provider.saveFile(file as MemoryStoredFile, board as unknown as BoardDto, 'md5vid');
      expect(result.isImage).toBe(false);
      expect(result.isVideo).toBe(true);
      expect(result.width).toBe(300);
      expect(result.height).toBe(400);
      expect(result.thumbnail).toEqual(Buffer.from('thumbv'));
      expect(result.thumbnailWidth).toBe(150);
      expect(result.thumbnailHeight).toBe(160);
    });

    it('should throw InternalServerErrorException for unknown media type', async () => {
      const file = { ...baseFile, mimeType: 'audio/mpeg', extension: 'mp3' };
      // isImage=false, isVideo=false
      jest.spyOn(provider as any, 'isMedia').mockReturnValue(false);
      jest.spyOn(provider as any, 'saveFileToSrc').mockResolvedValue(['dest', 'name.mp3']);
      fileSystem.writeBinaryFile.mockResolvedValue(undefined);

      const result = await provider.saveFile(file as MemoryStoredFile, board as unknown as BoardDto, 'md5audio');
      expect(result.isImage).toBe(false);
      expect(result.isVideo).toBe(false);
    });
  });

  describe('saveFileToSrc', () => {
    it('should call writeBinaryFile and return dest', async () => {
      const file = { buffer: Buffer.from('x'), extension: 'dat' };
      jest.spyOn(provider as any, 'getFileDestination').mockReturnValue(['the-dir', 'file.dat']);
      fileSystem.writeBinaryFile.mockResolvedValue(undefined);
      const result = await provider['saveFileToSrc'](file as MemoryStoredFile, 'test-url');
      expect(fileSystem.writeBinaryFile).toHaveBeenCalledWith(['the-dir', 'file.dat'], file.buffer);
      expect(result).toEqual(['the-dir', 'file.dat']);
    });
  });

  describe('getTimestampFilename', () => {
    it('should return the current timestamp as string', () => {
      const now = DateTime.now().toMillis();
      const ts = provider['getTimestampFilename']();
      expect(Number(ts)).toBeGreaterThanOrEqual(now - 1000);
      expect(Number(ts)).toBeLessThanOrEqual(DateTime.now().toMillis());
    });
  });

  describe('getFileDestination', () => {
    it('should return file path and name', () => {
      jest.spyOn(provider as any, 'getTimestampFilename').mockReturnValue('1234567890');
      const file = { extension: 'png' };
      const url = 'b';
      const [dir, name] = provider['getFileDestination'](file as MemoryStoredFile, url);
      expect(dir).toMatch(/^b[\/\\]src$/);
      expect(name).toBe('1234567890.png');
    });
  });

  describe('isMedia', () => {
    it('should return true for image media', () => {
      const file = { mimeType: 'image/gif' };
      expect(provider['isMedia'](file as MemoryStoredFile, 'image')).toBe(true);
      expect(provider['isMedia'](file as MemoryStoredFile, 'video')).toBe(false);
    });
    it('should return true for video media', () => {
      const file = { mimeType: 'video/mp4' };
      expect(provider['isMedia'](file as MemoryStoredFile, 'video')).toBe(true);
      expect(provider['isMedia'](file as MemoryStoredFile, 'image')).toBe(false);
    });
    it('should return false for other media', () => {
      const file = { mimeType: 'application/pdf' };
      expect(provider['isMedia'](file as MemoryStoredFile, 'image')).toBe(false);
      expect(provider['isMedia'](file as MemoryStoredFile, 'video')).toBe(false);
    });
  });

  describe('toMediaDimensions', () => {
    it('should set width and height from mediaFileHandlerProvider', async () => {
      const strategy: IMediaFileHandlerStrategy = new ImagemagickStrategy();
      const input = { width: 111, height: 222 } as Prisma.AttachedFileCreateInput;
      mediaFileHandlerProvider.getDimensions.mockResolvedValue({ width: 111, height: 222 });
      await provider['toMediaDimensions'](strategy, input, 'dest', 'name');
      expect(input.width).toBe(111);
      expect(input.height).toBe(222);
    });
  });

  describe('toMediaThumbnail', () => {
    it('should set thumbnail and its dimensions from mediaFileHandlerProvider', async () => {
      const strategy: IMediaFileHandlerStrategy = new ImagemagickStrategy();
      const input = {
        width: 10,
        height: 20,
        thumbnail: null,
        thumbnailWidth: null,
        thumbnailHeight: null
      } as Prisma.AttachedFileCreateInput;
      mediaFileHandlerProvider.createThumbnail.mockResolvedValue({
        thumbnail: Buffer.from('thumb'),
        thumbnailWidth: 5,
        thumbnailHeight: 6
      });
      await provider['toMediaThumbnail'](strategy, input, 'dest', 'file');
      expect(input.thumbnail).toEqual(Buffer.from('thumb'));
      expect(input.thumbnailWidth).toBe(5);
      expect(input.thumbnailHeight).toBe(6);
    });
  });
});
