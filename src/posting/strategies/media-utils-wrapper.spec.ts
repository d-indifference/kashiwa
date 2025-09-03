import { MediaUtilsWrapper } from './media-utils-wrapper';
import { InternalServerErrorException } from '@nestjs/common';
import { exec } from 'child_process';

jest.mock('child_process', () => ({
  exec: jest.fn()
}));

describe('MediaUtilsWrapper', () => {
  const mockExec = exec as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDimensions', () => {
    it('should return width and height when command succeeds with ":" separator', async () => {
      mockExec.mockImplementation((cmd, cb) => {
        cb(null, { stdout: '800:600', stderr: '' });
        return {} as any;
      });

      const result = await MediaUtilsWrapper.getDimensions('fake-command', ':');

      expect(result).toEqual({ width: 800, height: 600 });
    });

    it('should return width and height when command succeeds with "x" separator', async () => {
      mockExec.mockImplementation((cmd, cb) => {
        cb(null, { stdout: '1024x768', stderr: '' });
        return {} as any;
      });

      const result = await MediaUtilsWrapper.getDimensions('fake-command', 'x');

      expect(result).toEqual({ width: 1024, height: 768 });
    });

    it('should throw InternalServerErrorException if stderr is present', async () => {
      mockExec.mockImplementation((cmd, cb) => {
        cb(null, { stdout: '', stderr: 'some error' });
        return {} as any;
      });

      await expect(MediaUtilsWrapper.getDimensions('fake', ':')).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw Error if stdout is invalid', async () => {
      mockExec.mockImplementation((cmd, cb) => {
        cb(null, { stdout: 'invalid_output', stderr: '' });
        return {} as any;
      });

      await expect(MediaUtilsWrapper.getDimensions('fake', ':')).rejects.toThrow(/Invalid dimensions: invalid_output/);
    });
  });

  describe('createThumbnail', () => {
    it('should resolve when command succeeds', async () => {
      mockExec.mockImplementation((cmd, cb) => {
        cb(null, { stdout: '', stderr: '' });
        return {} as any;
      });

      await expect(MediaUtilsWrapper.createThumbnail('thumb-command')).resolves.toBeUndefined();
    });

    it('should throw InternalServerErrorException if exec fails', async () => {
      mockExec.mockImplementation((cmd, cb) => {
        cb(new Error('exec failed'), null);
        return {} as any;
      });

      await expect(MediaUtilsWrapper.createThumbnail('thumb-command')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
