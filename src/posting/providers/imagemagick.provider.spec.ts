import { ImagemagickProvider } from './imagemagick.provider';
import { InternalServerErrorException } from '@nestjs/common';
import * as im from 'imagemagick';
import * as path from 'node:path';
import { Constants } from '@library/constants';

jest.mock('imagemagick', () => ({
  identify: jest.fn(),
  convert: jest.fn()
}));

describe('ImagemagickProvider', () => {
  let provider: ImagemagickProvider;

  beforeEach(() => {
    provider = new ImagemagickProvider();
    jest.clearAllMocks();
  });

  describe('getImageDimensions', () => {
    it('should resolve with correct dimensions', async () => {
      (im.identify as unknown as jest.Mock).mockImplementation((args, cb) => cb(null, '100x200'));

      const dims = await provider.getImageDimensions(['board', 'src', 'file.jpg']);
      expect(dims).toEqual({ width: 100, height: 200 });

      const expectedPath = path.join(Constants.Paths.APP_VOLUME, 'board', 'src', 'file.jpg');
      expect(im.identify).toHaveBeenCalledWith(['-format', '%wx%h', expectedPath], expect.any(Function));
    });

    it('should trim and parse output', async () => {
      (im.identify as unknown as jest.Mock).mockImplementation((args, cb) => cb(null, ' 10x20 '));
      const dims = await provider.getImageDimensions(['foo', 'bar.jpg']);
      expect(dims).toEqual({ width: 10, height: 20 });
    });

    it('should throw on invalid dimensions', async () => {
      (im.identify as unknown as jest.Mock).mockImplementation((args, cb) => cb(null, 'invalid_output'));
      await expect(provider.getImageDimensions(['bad.jpg'])).rejects.toThrow('Invalid dimensions: invalid_output');
    });

    it('should reject on error', async () => {
      (im.identify as unknown as jest.Mock).mockImplementation((args, cb) => cb(new Error('fail'), null));
      await expect(provider.getImageDimensions(['bad.jpg'])).rejects.toThrow('fail');
    });
  });

  describe('thumbnailImage', () => {
    it('should throw if dimensions are missing', async () => {
      try {
        await provider.thumbnailImage('dest', 'file.jpg', {
          width: undefined as unknown as number,
          height: undefined as unknown as number
        });
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toBe('Internal Server Error');
      }
    });

    it('should produce thumbnail with correct name and size (width > height)', async () => {
      (im.convert as unknown as jest.Mock).mockImplementation((args, cb) => cb(null));

      const result = await provider.thumbnailImage('board/src', 'image.jpg', { width: 400, height: 300 });

      expect(result.thumbnail).toBe('images.jpg');
      expect(result.thumbnailWidth).toBe(Constants.DEFAULT_THUMBNAIL_SIDE);
      expect(result.thumbnailHeight).toBe(Math.floor((Constants.DEFAULT_THUMBNAIL_SIDE * 300) / 400));
    });

    it('should produce thumbnail with correct name and size (height > width)', async () => {
      (im.convert as unknown as jest.Mock).mockImplementation((args, cb) => cb(null));

      const result = await provider.thumbnailImage('board/src', 'pic.jpg', { width: 300, height: 400 });
      expect(result.thumbnailWidth).toBe(Math.floor((Constants.DEFAULT_THUMBNAIL_SIDE * 300) / 400));
      expect(result.thumbnailHeight).toBe(Constants.DEFAULT_THUMBNAIL_SIDE);
    });

    it('should produce thumbnail with correct name and size (square)', async () => {
      (im.convert as unknown as jest.Mock).mockImplementation((args, cb) => cb(null));
      const result = await provider.thumbnailImage('board/src', 'pic.jpg', { width: 200, height: 200 });
      expect(result.thumbnailWidth).toBe(200);
      expect(result.thumbnailHeight).toBe(200);
    });

    it('should resolve with correct thumbnail data and call convert', async () => {
      (im.convert as unknown as jest.Mock).mockImplementation((args, cb) => cb(null));
      const result = await provider.thumbnailImage(`board${path.sep}src`, 'img.png', { width: 300, height: 300 });
      expect(result.thumbnail).toBe('imgs.png');
      expect(im.convert).toHaveBeenCalledWith(
        [
          path.join(Constants.Paths.APP_VOLUME, `board${path.sep}src`, 'img.png'),
          '-coalesce',
          '-resize',
          '200x200',
          '-layers',
          'optimize',
          '-loop',
          '0',
          path.join(Constants.Paths.APP_VOLUME, 'board', Constants.THUMB_DIR, 'imgs.png')
        ],
        expect.any(Function)
      );
    });

    it('should reject if convert fails', async () => {
      (im.convert as unknown as jest.Mock).mockImplementation((args, cb) => cb(new Error('convert fail')));
      await expect(provider.thumbnailImage('board/src', 'img.png', { width: 100, height: 100 })).rejects.toThrow(
        'convert fail'
      );
    });
  });
});
