import { MediaFileHandlerProvider } from './media-file-handler.provider';
import { InternalServerErrorException } from '@nestjs/common';
import * as path from 'node:path';
import { ConfigService } from '@nestjs/config';

const Constants = {
  THUMB_DIR: 'thumb',
  DEFAULT_THUMBNAIL_SIDE: 100
};

describe('MediaFileHandlerProvider', () => {
  let provider: MediaFileHandlerProvider;
  let config: jest.Mocked<ConfigService>;
  let strategy: any;

  beforeEach(() => {
    config = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'file-storage.path') {
          return `${path.sep}app${path.sep}volume`;
        }
        throw new Error(`Unexpected config key: ${key}`);
      })
    } as any;
    provider = new MediaFileHandlerProvider(config);
    (provider as any).Constants = Constants;

    strategy = {
      getDimensions: jest.fn(),
      createThumbnail: jest.fn()
    };
  });

  describe('getDimensions', () => {
    it('should call strategy.getDimensions with correct full path and return its result', async () => {
      const fileRelativePath = ['board1', 'file.jpg'];
      const expectedPath = path.join(`${path.sep}app${path.sep}volume`, ...fileRelativePath);
      const dimensions = { width: 123, height: 456 };

      strategy.getDimensions.mockResolvedValue(dimensions);

      const result = await provider.getDimensions(strategy, fileRelativePath);

      expect(strategy.getDimensions).toHaveBeenCalledWith(expectedPath);
      expect(result).toBe(dimensions);
    });
  });

  describe('thumbnailImage', () => {
    const dest = 'board1/src';
    const file = '123456789.jpg';

    it('should throw InternalServerErrorException if no width and height', async () => {
      await expect(
        provider.createThumbnail(strategy, false, dest, file, { width: undefined, height: undefined } as any)
      ).rejects.toThrow(InternalServerErrorException);

      await expect(
        provider.createThumbnail(strategy, false, dest, file, { width: null, height: null } as any)
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should calculate thumbnail size and call strategy.createThumbnail with correct args (image)', async () => {
      const dimensions = { width: 400, height: 300 };

      const filePath = path.join(`${path.sep}app${path.sep}volume`, dest, file);
      const [filename, ext] = file.split('.');
      const thumbName = `${filename}s.${ext}`;
      const boardUrl = dest.split(path.sep)[0]; // board1
      const thumbDir = path.join(`${path.sep}app${path.sep}volume`, boardUrl, Constants.THUMB_DIR);
      const thumbPath = path.join(thumbDir, thumbName);

      await provider.createThumbnail(strategy, false, dest, file, dimensions);

      expect(strategy.createThumbnail).toHaveBeenCalledWith(filePath, thumbPath, 200, 150);
    });

    it('should calculate thumbnail size and call strategy.createThumbnail with correct args (video)', async () => {
      const dimensions = { width: 400, height: 300 };
      const isVideo = true;

      const filePath = path.join(`${path.sep}app${path.sep}volume`, dest, file);
      const [filename] = file.split('.');
      const thumbExt = 'png';
      const thumbName = `${filename}s.${thumbExt}`;
      const boardUrl = dest.split(path.sep)[0];
      const thumbDir = path.join(`${path.sep}app${path.sep}volume`, boardUrl, Constants.THUMB_DIR);
      const thumbPath = path.join(thumbDir, thumbName);

      await provider.createThumbnail(strategy, isVideo, dest, file, dimensions);

      expect(strategy.createThumbnail).toHaveBeenCalledWith(filePath, thumbPath, 200, 150);
    });

    it('should handle equal width and height', async () => {
      const dimensions = { width: 400, height: 400 };
      const isVideo = false;

      const filePath = path.join(`${path.sep}app${path.sep}volume`, dest, file);
      const [filename, ext] = file.split('.');
      const thumbName = `${filename}s.${ext}`;
      const boardUrl = dest.split(path.sep)[0];
      const thumbDir = path.join(`${path.sep}app${path.sep}volume`, boardUrl, Constants.THUMB_DIR);
      const thumbPath = path.join(thumbDir, thumbName);

      await provider.createThumbnail(strategy, isVideo, dest, file, dimensions);

      expect(strategy.createThumbnail).toHaveBeenCalledWith(filePath, thumbPath, 200, 200);
    });

    it('should return thumbnail info', async () => {
      const dimensions = { width: 400, height: 300 };
      strategy.createThumbnail.mockResolvedValue(undefined);

      const result = await provider.createThumbnail(strategy, false, dest, file, dimensions);

      expect(result).toEqual({
        thumbnail: 'images.jpgs.jpg'
          .replace('images.jpgs.jpg', '123456789s.jpg')
          .replace(/images.jpgs.jpg/, '123456789s.jpg')
          .replace('images.jpgs.jpg', '123456789s.jpg'),
        thumbnailWidth: 200,
        thumbnailHeight: 150
      });
    });
  });
});
