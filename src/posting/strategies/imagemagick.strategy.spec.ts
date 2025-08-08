import { ImagemagickStrategy } from './imagemagick.strategy';
import * as im from 'imagemagick';

jest.mock('imagemagick');

describe('ImagemagickStrategy', () => {
  let strategy: ImagemagickStrategy;
  let mockIdentify: jest.Mock;
  let mockConvert: jest.Mock;

  beforeEach(() => {
    strategy = new ImagemagickStrategy();
    mockIdentify = jest.fn();
    mockConvert = jest.fn();
    (im.identify as unknown as jest.Mock).mockImplementation(mockIdentify);
    (im.convert as unknown as jest.Mock).mockImplementation(mockConvert);
    jest.clearAllMocks();
  });

  describe('getDimensions', () => {
    it('should return width and height on valid output', async () => {
      mockIdentify.mockImplementation((_args, cb) => {
        cb(null, '1920x1080');
      });

      const result = await strategy.getDimensions('/path/image.png');

      expect(mockIdentify).toHaveBeenCalledWith(['-format', '%wx%h', '/path/image.png[0]'], expect.any(Function));
      expect(result).toEqual({ width: 1920, height: 1080 });
    });

    it('should reject if identify returns error', async () => {
      mockIdentify.mockImplementation((_args, cb) => {
        cb(new Error('identify failed'));
      });

      await expect(strategy.getDimensions('/path/image.png')).rejects.toThrow('identify failed');
    });

    it('should throw if output is invalid', async () => {
      mockIdentify.mockImplementation((_args, cb) => {
        cb(null, 'abcxxyz');
      });

      await expect(strategy.getDimensions('/path/image.png')).rejects.toThrow(/Invalid dimensions/);
    });
  });

  describe('createThumbnail', () => {
    it('should resolve when convert succeeds', async () => {
      mockConvert.mockImplementation((_args, cb) => {
        cb(null);
      });

      await expect(strategy.createThumbnail('/src.png', '/thumb.png', 100, 200)).resolves.toBeUndefined();

      expect(mockConvert).toHaveBeenCalledWith(
        ['/src.png', '-coalesce', '-resize', '100x200', '-layers', 'optimize', '-loop', '0', '/thumb.png'],
        expect.any(Function)
      );
    });

    it('should reject when convert fails', async () => {
      mockConvert.mockImplementation((_args, cb) => {
        cb(new Error('convert failed'));
      });

      await expect(strategy.createThumbnail('/src.png', '/thumb.png', 100, 200)).rejects.toThrow('convert failed');
    });

    it('should throw InternalServerErrorException if convert throws synchronously', async () => {
      mockConvert.mockImplementation(() => {
        throw new Error('sync error');
      });

      await expect(strategy.createThumbnail('/src.png', '/thumb.png', 100, 200)).rejects.toBeInstanceOf(Error);
    });
  });
});
