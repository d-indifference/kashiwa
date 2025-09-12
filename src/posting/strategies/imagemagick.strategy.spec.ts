import { ImagemagickStrategy } from './imagemagick.strategy';
import { MediaUtilsWrapper } from '@posting/strategies/media-utils-wrapper';

jest.mock('@posting/strategies/media-utils-wrapper', () => ({
  MediaUtilsWrapper: {
    getDimensions: jest.fn(),
    createThumbnail: jest.fn()
  }
}));

describe('ImagemagickStrategy', () => {
  let strategy: ImagemagickStrategy;

  beforeEach(() => {
    strategy = new ImagemagickStrategy();
    jest.clearAllMocks();
  });

  describe('getDimensions', () => {
    it('should call MediaUtilsWrapper.getDimensions with correct command and separator', async () => {
      (MediaUtilsWrapper.getDimensions as jest.Mock).mockResolvedValue({ width: 800, height: 600 });

      const filePath = '/path/to/image.png';
      const result = await strategy.getDimensions(filePath);

      expect(MediaUtilsWrapper.getDimensions).toHaveBeenCalledWith(`identify -format %wx%h "${filePath}"[0]`, 'x');
      expect(result).toEqual({ width: 800, height: 600 });
    });

    it('should propagate errors from MediaUtilsWrapper.getDimensions', async () => {
      (MediaUtilsWrapper.getDimensions as jest.Mock).mockRejectedValue(new Error('identify failed'));

      await expect(strategy.getDimensions('/bad/image.png')).rejects.toThrow('identify failed');
    });
  });

  describe('createThumbnail', () => {
    it('should call MediaUtilsWrapper.createThumbnail with correct command', async () => {
      (MediaUtilsWrapper.createThumbnail as jest.Mock).mockResolvedValue(undefined);

      const srcPath = '/path/to/image.gif';
      const thumbPath = '/path/to/thumb.gif';

      await strategy.createThumbnail(srcPath, thumbPath, 320, 240);

      expect(MediaUtilsWrapper.createThumbnail).toHaveBeenCalledWith(
        `convert "${srcPath}" -coalesce -resize 320x240 -layers optimize -loop 0 "${thumbPath}"`
      );
    });

    it('should propagate errors from MediaUtilsWrapper.createThumbnail', async () => {
      (MediaUtilsWrapper.createThumbnail as jest.Mock).mockRejectedValue(new Error('convert failed'));

      await expect(strategy.createThumbnail('src.gif', 'thumb.gif', 100, 100)).rejects.toThrow('convert failed');
    });
  });
});
