import { FfmpegStrategy } from './ffmpeg.strategy';
import { InternalServerErrorException } from '@nestjs/common';

describe('FfmpegStrategy', () => {
  let strategy: FfmpegStrategy;
  let mockExec: jest.Mock;

  beforeEach(() => {
    strategy = new FfmpegStrategy();
    mockExec = jest.fn();
    jest.spyOn<any, any>(strategy as any, 'execAsync').mockReturnValue(mockExec);
  });

  describe('getDimensions', () => {
    it('should return width and height when stdout is valid', async () => {
      mockExec.mockResolvedValue({ stdout: '1920,1080', stderr: '' });

      const result = await strategy.getDimensions('/path/video.mp4');

      expect(mockExec).toHaveBeenCalledWith(expect.stringContaining('ffprobe -v error -select_streams v:0'));
      expect(result).toEqual({ width: 1920, height: 1080 });
    });

    it('should throw InternalServerErrorException if stderr is not empty', async () => {
      mockExec.mockResolvedValue({ stdout: '', stderr: 'error here' });

      await expect(strategy.getDimensions('/path/video.mp4')).rejects.toBeInstanceOf(InternalServerErrorException);
    });

    it('should throw Error if stdout is invalid', async () => {
      mockExec.mockResolvedValue({ stdout: 'abc,xyz', stderr: '' });

      await expect(strategy.getDimensions('/path/video.mp4')).rejects.toThrow(/Invalid dimensions/);
    });
  });

  describe('createThumbnail', () => {
    it('should call ffmpeg with correct params', async () => {
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });

      await strategy.createThumbnail('/path/video.mp4', '/path/thumb.png', 320, 240);

      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining(
          'ffmpeg -i "/path/video.mp4" -vf "scale=320:240:flags=lanczos,format=rgba" -frames:v 1 -pix_fmt rgba "/path/thumb.png"'
        )
      );
    });

    it('should throw InternalServerErrorException if exec fails', async () => {
      mockExec.mockRejectedValue(new Error('ffmpeg fail'));

      await expect(strategy.createThumbnail('/src.mp4', '/thumb.png', 100, 100)).rejects.toBeInstanceOf(
        InternalServerErrorException
      );
    });
  });
});
