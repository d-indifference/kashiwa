/* eslint-disable @typescript-eslint/no-require-imports */
import { FormFileProvider } from './form-file.provider';
import { FileSystemProvider } from '@library/providers';
import { ImagemagickProvider } from '@posting/providers/imagemagick.provider';
import { Constants } from '@library/constants';
import { DateTime } from 'luxon';
import * as crypto from 'node:crypto';
import * as mime from 'mime-types';

jest.mock('mime-types', () => ({
  lookup: jest.fn()
}));

describe('FormFileProvider', () => {
  let fileSystemMock: jest.Mocked<FileSystemProvider>;
  let imagemagickMock: jest.Mocked<ImagemagickProvider>;
  let provider: FormFileProvider;

  beforeEach(() => {
    fileSystemMock = {
      writeBinaryFile: jest.fn()
    } as any;

    imagemagickMock = {
      getImageDimensions: jest.fn(),
      thumbnailImage: jest.fn()
    } as any;

    provider = new FormFileProvider(fileSystemMock, imagemagickMock);
  });

  describe('md5', () => {
    it('should return md5 hash of buffer', () => {
      const file = { buffer: Buffer.from('hello') } as any;
      const hash = provider.md5(file);
      const expected = crypto.createHash('md5').update(file.buffer).digest('hex');
      expect(hash).toBe(expected);
    });
  });

  describe('saveFile', () => {
    it('should save image file and set image metadata', async () => {
      // Mock data
      const file = {
        mimeType: 'image/png',
        extension: 'png',
        size: 123,
        buffer: Buffer.from('img')
      } as any;
      const board = { id: 1, url: 'b' } as any;
      const md5 = 'mockmd5';

      // Mock saveFileToSrc
      const dest = ['/b/src', '123456789.png'];
      jest.spyOn(provider as any, 'saveFileToSrc').mockResolvedValue(dest);

      // Mock imagemagick
      imagemagickMock.getImageDimensions.mockResolvedValue({ width: 300, height: 300 });
      imagemagickMock.thumbnailImage.mockResolvedValue({
        thumbnail: '123456789s.png',
        thumbnailWidth: 200,
        thumbnailHeight: 200
      });

      const result = await provider.saveFile(file, board, md5);

      expect(result).toEqual({
        isImage: true,
        mime: 'image/png',
        name: '123456789.png',
        size: 123,
        md5,
        board: { connect: { id: board.id } },
        width: 300,
        height: 300,
        thumbnail: '123456789s.png',
        thumbnailWidth: 200,
        thumbnailHeight: 200
      });

      expect(imagemagickMock.getImageDimensions).toHaveBeenCalledWith(dest);
      expect(imagemagickMock.thumbnailImage).toHaveBeenCalledWith(dest[0], dest[1], { width: 300, height: 300 });
    });

    it('should save non-image file and set correct mime', async () => {
      const file = {
        mimeType: 'application/pdf',
        extension: 'pdf',
        size: 55,
        buffer: Buffer.from('filedata')
      } as any;
      const board = { id: 2, url: 'a' } as any;
      const md5 = 'md5val';

      const dest = ['a/src', '987654321.pdf'];
      jest.spyOn(provider as any, 'saveFileToSrc').mockResolvedValue(dest);

      (mime.lookup as jest.Mock).mockReturnValue('application/pdf');

      const result = await provider.saveFile(file, board, md5);

      expect(result.isImage).toBe(false);
      expect(result.mime).toBe('application/pdf');
      expect(result.name).toBe('987654321.pdf');
      expect(result.size).toBe(55);
      expect(result.md5).toBe(md5);
      expect(result.board).toEqual({ connect: { id: board.id } });
      // Should not set image properties
      expect(result.width).toBeUndefined();
      expect(result.thumbnail).toBeUndefined();
    });

    it('should fallback to original mime if lookup returns false', async () => {
      const file = {
        mimeType: 'custom/mime',
        extension: 'bin',
        size: 1,
        buffer: Buffer.from('x')
      } as any;
      const board = { id: 3, url: 'c' } as any;
      const md5 = 'somehash';

      const dest = ['/c/src', '010101.bin'];
      jest.spyOn(provider as any, 'saveFileToSrc').mockResolvedValue(dest);

      (mime.lookup as jest.Mock).mockReturnValue(false);

      const result = await provider.saveFile(file, board, md5);

      expect(result.mime).toBe('custom/mime');
    });
  });

  describe('getTimestampFilename', () => {
    it('should return current timestamp as string', () => {
      const spy = jest.spyOn(DateTime, 'now').mockReturnValue({
        toMillis: () => 12345
      } as any);
      const filename = (provider as any).getTimestampFilename();
      expect(filename).toBe('12345');
      spy.mockRestore();
    });
  });

  describe('getFileDestination', () => {
    it('should return correct destination and filename', () => {
      const file = { extension: 'jpg' } as any;
      const url = '/board';
      jest.spyOn(provider as any, 'getTimestampFilename').mockReturnValue('999999');
      const result = (provider as any).getFileDestination(file, url);
      expect(result).toEqual([`${url}${require('node:path').sep}${Constants.SRC_DIR}`, '999999.jpg']);
    });
  });

  describe('isImage', () => {
    it('should return true for image mime', () => {
      const file = { mimeType: 'image/jpeg' } as any;
      expect((provider as any).isImage(file)).toBe(true);
    });
    it('should return false for non-image mime', () => {
      const file = { mimeType: 'audio/mp3' } as any;
      expect((provider as any).isImage(file)).toBe(false);
    });
  });

  describe('toImageDimensions', () => {
    it('should set width and height from imagemagick', async () => {
      const input: any = {};
      imagemagickMock.getImageDimensions.mockResolvedValue({ width: 12, height: 34 });
      await (provider as any).toImageDimensions(input, 'dest', 'file.png');
      expect(input.width).toBe(12);
      expect(input.height).toBe(34);
      expect(imagemagickMock.getImageDimensions).toHaveBeenCalledWith(['dest', 'file.png']);
    });
  });

  describe('toImageThumbnail', () => {
    it('should set thumbnail data from imagemagick', async () => {
      const input: any = { width: 2, height: 3 };
      imagemagickMock.thumbnailImage.mockResolvedValue({
        thumbnail: '1234567890s.png',
        thumbnailWidth: 1,
        thumbnailHeight: 2
      });
      await (provider as any).toImageThumbnail(input, 'dest', '1234567890s.png');
      expect(input.thumbnail).toEqual('1234567890s.png');
      expect(input.thumbnailWidth).toBe(1);
      expect(input.thumbnailHeight).toBe(2);
      expect(imagemagickMock.thumbnailImage).toHaveBeenCalledWith('dest', '1234567890s.png', { width: 2, height: 3 });
    });
  });
});
