import { FfmpegStrategy } from './ffmpeg.strategy';
import { MediaUtilsWrapper } from '@posting/strategies/media-utils-wrapper';

jest.mock('@posting/strategies/media-utils-wrapper', () => ({
  MediaUtilsWrapper: {
    getDimensions: jest.fn(),
    createThumbnail: jest.fn()
  }
}));

describe('FfmpegStrategy', () => {
  let strategy: FfmpegStrategy;

  beforeEach(() => {
    strategy = new FfmpegStrategy();
    jest.clearAllMocks();
  });

  describe('getDimensions', () => {
    it('should call MediaUtilsWrapper.getDimensions with correct command', async () => {
      (MediaUtilsWrapper.getDimensions as jest.Mock).mockResolvedValue({ width: 1920, height: 1080 });

      const filePath = '/path/to/video.mp4';
      const result = await strategy.getDimensions(filePath);

      expect(MediaUtilsWrapper.getDimensions).toHaveBeenCalledWith(
        `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${filePath}"`,
        ','
      );
      expect(result).toEqual({ width: 1920, height: 1080 });
    });

    it('should propagate errors from MediaUtilsWrapper.getDimensions', async () => {
      (MediaUtilsWrapper.getDimensions as jest.Mock).mockRejectedValue(new Error('ffprobe failed'));

      await expect(strategy.getDimensions('/bad/file')).rejects.toThrow('ffprobe failed');
    });
  });

  describe('createThumbnail', () => {
    it('should call MediaUtilsWrapper.createThumbnail with correct command', async () => {
      (MediaUtilsWrapper.createThumbnail as jest.Mock).mockResolvedValue(undefined);

      const srcPath = '/path/to/video.mp4';
      const thumbPath = '/path/to/thumb.png';

      await strategy.createThumbnail(srcPath, thumbPath, 320, 240);

      expect(MediaUtilsWrapper.createThumbnail).toHaveBeenCalledWith(
        `ffmpeg -i "${srcPath}" -vf "scale=320:240:flags=lanczos,format=rgba" -frames:v 1 -pix_fmt rgba "${thumbPath}"`
      );
    });

    it('should propagate errors from MediaUtilsWrapper.createThumbnail', async () => {
      (MediaUtilsWrapper.createThumbnail as jest.Mock).mockRejectedValue(new Error('ffmpeg failed'));

      await expect(strategy.createThumbnail('src', 'thumb', 100, 100)).rejects.toThrow('ffmpeg failed');
    });
  });
});
