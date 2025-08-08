import { IMediaFileHandlerStrategy } from '@posting/strategies/media-file-handler.strategy.interface';
import { exec, PromiseWithChild } from 'child_process';
import { promisify } from 'node:util';
import { InternalServerErrorException } from '@nestjs/common';

/**
 * Strategy for processing videos by `ffmpeg`
 */
export class FfmpegStrategy implements IMediaFileHandlerStrategy {
  /**
   * Get dimensions of media file
   * @param filePath Full path to media file
   */
  public async getDimensions(filePath: string): Promise<{ width: number; height: number }> {
    const { stdout, stderr } = await this.execAsync()(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${filePath}"`
    );

    if (stderr) {
      throw new InternalServerErrorException(stderr);
    }

    const [w, h] = stdout.trim().split(',').map(Number);
    if (isNaN(w) || isNaN(h)) {
      throw new Error(`Invalid dimensions: ${stdout}`);
    }
    return { width: w, height: h };
  }

  /**
   * Create preview thumbnail for media file
   * @param srcPath Full path to source file
   * @param thumbPath Full path to thumbnail path
   * @param tnWidth Thumbnail width
   * @param tnHeight Thumbnail height
   */
  public async createThumbnail(srcPath: string, thumbPath: string, tnWidth: number, tnHeight: number): Promise<void> {
    try {
      await this.execAsync()(
        `ffmpeg -i "${srcPath}" -vf "scale=${tnWidth}:${tnHeight}:flags=lanczos,format=rgba" -frames:v 1 -pix_fmt rgba "${thumbPath}"`
      );
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  /**
   * A wrapper for `exec` from `node:child_process`
   */
  private execAsync(): (command: string) => PromiseWithChild<{ stdout: string; stderr: string }> {
    return promisify(exec);
  }
}
