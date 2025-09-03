import { InternalServerErrorException } from '@nestjs/common';
import { LOCALE } from '@locale/locale';
import { exec, PromiseWithChild } from 'child_process';
import { promisify } from 'node:util';

/**
 * Utility wrapper for executing system commands related to media processing.
 * Provides methods to extract media dimensions and create thumbnails using shell commands
 */
export class MediaUtilsWrapper {
  /**
   * Executes a shell command to retrieve media dimensions
   * @param command The shell command to execute (e.g., ffprobe or identify)
   * @param outputSeparator The separator used in the command output to split width and height
   */
  public static async getDimensions(
    command: string,
    outputSeparator: string
  ): Promise<{ width: number; height: number }> {
    const { stdout, stderr } = await this.execAsync()(command);

    if (stderr) {
      throw new InternalServerErrorException(stderr);
    }

    const [w, h] = stdout.trim().split(outputSeparator).map(Number);
    if (isNaN(w) || isNaN(h)) {
      throw new Error(`${LOCALE.INVALID_DIMENSIONS as string}: ${stdout}`);
    }
    return { width: w, height: h };
  }

  /**
   * Executes a shell command to generate a media thumbnail
   * @param command The shell command to execute for thumbnail creation (e.g., ffmpeg or convert)
   */
  public static async createThumbnail(command: string): Promise<void> {
    try {
      await this.execAsync()(command);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  /**
   * A wrapper for `exec` from `node:child_process`
   */
  private static execAsync(): (command: string) => PromiseWithChild<{ stdout: string; stderr: string }> {
    return promisify(exec);
  }
}
