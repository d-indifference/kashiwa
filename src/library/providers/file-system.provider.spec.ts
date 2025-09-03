/* eslint-disable @typescript-eslint/ban-ts-comment */

import { FileSystemProvider } from './file-system.provider';
import { NotFoundException } from '@nestjs/common';
import * as path from 'path';

const LOCALE = {
  FILE_WAS_NOT_FOUND: 'File was not found'
};

jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(),
  readdir: jest.fn(),
  emptydir: jest.fn(),
  rename: jest.fn(),
  remove: jest.fn(),
  exists: jest.fn(),
  existsSync: jest.fn(),
  copy: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn()
}));
import * as fsExtra from 'fs-extra';

import getFolderSize from 'get-folder-size';
Object.defineProperty(getFolderSize, 'loose', {
  value: jest.fn(),
  writable: true
});

jest.mock('mime-types', () => ({
  lookup: jest.fn()
}));
import * as mime from 'mime-types';

jest.mock('fs', () => ({
  createReadStream: jest.fn()
}));
import { createReadStream } from 'fs';

describe('FileSystemProvider', () => {
  let provider: FileSystemProvider;
  let mockConfig: { getOrThrow: jest.Mock };

  const VOLUME_PATH = `${path.sep}app${path.sep}volume`;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'file-storage.path') {
          return VOLUME_PATH;
        }
        throw new Error('Unexpected config key');
      })
    };
    // @ts-ignore
    provider = new FileSystemProvider(mockConfig);
  });

  describe('ensureDirOutOfVolume', () => {
    it('should call fsExtra.ensureDir', async () => {
      await provider.ensureDirOutOfVolume('/tmp/test');
      expect(fsExtra.ensureDir).toHaveBeenCalledWith('/tmp/test');
    });
  });

  describe('ensureDir', () => {
    it('should join volume path and call ensureDirOutOfVolume', async () => {
      const spy = jest.spyOn(provider, 'ensureDirOutOfVolume').mockResolvedValue();
      await provider.ensureDir(['folder']);
      expect(spy).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}folder`);
    });
  });

  describe('readDir', () => {
    it('should call fsExtra.readdir with correct path', async () => {
      (fsExtra.readdir as unknown as jest.Mock).mockResolvedValue(['file1']);
      const result = await provider.readDir(['folder']);
      expect(fsExtra.readdir).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}folder`, {
        withFileTypes: true
      });
      expect(result).toEqual(['file1']);
    });

    it('should use root path if no relativePath', async () => {
      (fsExtra.readdir as unknown as jest.Mock).mockResolvedValue(['fileRoot']);
      await provider.readDir();
      expect(fsExtra.readdir).toHaveBeenCalledWith(VOLUME_PATH, { withFileTypes: true });
    });
  });

  describe('emptyDir', () => {
    it('should call fsExtra.emptydir with correct path', async () => {
      await provider.emptyDir(['folder']);
      expect(fsExtra.emptydir).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}folder`);
    });
  });

  describe('dirSize', () => {
    it('should call getFolderSize.loose', async () => {
      (getFolderSize.loose as jest.Mock).mockResolvedValue(12345);
      const result = await provider.dirSize(['folder']);
      expect(getFolderSize.loose).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}folder`);
      expect(result).toBe(12345);
    });
  });

  describe('renameDir', () => {
    it('should call fsExtra.rename', async () => {
      await provider.renameDir(['old'], ['new']);
      expect(fsExtra.rename).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}old`, `${VOLUME_PATH}${path.sep}new`);
    });
  });

  describe('removePathOutOfVolume', () => {
    it('should call fsExtra.remove', async () => {
      await provider.removePathOutOfVolume('/tmp/test');
      expect(fsExtra.remove).toHaveBeenCalledWith('/tmp/test');
    });
  });

  describe('removePath', () => {
    it('should join volume path and call removePathOutOfVolume', async () => {
      const spy = jest.spyOn(provider, 'removePathOutOfVolume').mockResolvedValue();
      await provider.removePath(['folder']);
      expect(spy).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}folder`);
    });
  });

  describe('pathExists', () => {
    it('should join volume path and call fsExtra.exists', async () => {
      (fsExtra.exists as unknown as jest.Mock).mockResolvedValue(true);
      const result = await provider.pathExists(['folder']);
      expect(fsExtra.exists).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}folder`);
      expect(result).toBe(true);
    });
  });

  describe('copyPath', () => {
    it('should join volume path and call fsExtra.copy', async () => {
      await provider.copyPath('/tmp/src', ['target']);
      expect(fsExtra.copy).toHaveBeenCalledWith('/tmp/src', `${VOLUME_PATH}${path.sep}target`);
    });
  });

  describe('copyPathAtVolume', () => {
    it('should join volume path and call copyPath', async () => {
      const spy = jest.spyOn(provider, 'copyPath').mockResolvedValue();
      await provider.copyPathAtVolume(['src'], ['target']);
      expect(spy).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}src`, ['target']);
    });
  });

  describe('readTextFileOutOfVolume', () => {
    it('should call fsExtra.readFile with encoding', async () => {
      (fsExtra.readFile as unknown as jest.Mock).mockResolvedValue('data');
      const result = await provider.readTextFileOutOfVolume('/tmp/test.txt');
      expect(fsExtra.readFile).toHaveBeenCalledWith('/tmp/test.txt', { encoding: 'utf-8' });
      expect(result).toBe('data');
    });
  });

  describe('readTextFile', () => {
    it('should join volume path and call readTextFileOutOfVolume', async () => {
      const spy = jest.spyOn(provider, 'readTextFileOutOfVolume').mockResolvedValue('data');
      await provider.readTextFile(['folder', 'file.txt']);
      expect(spy).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}folder${path.sep}file.txt`);
    });
  });

  describe('writeTextFile', () => {
    it('should call fsExtra.writeFile with encoding', async () => {
      await provider.writeTextFile(['folder', 'file.txt'], 'content');
      expect(fsExtra.writeFile).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}folder${path.sep}file.txt`, 'content', {
        encoding: 'utf-8'
      });
    });
  });

  describe('writeBinaryFile', () => {
    it('should call fsExtra.writeFile', async () => {
      const buffer = Buffer.from([1, 2, 3]);
      await provider.writeBinaryFile(['folder', 'file.bin'], buffer);
      expect(fsExtra.writeFile).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}folder${path.sep}file.bin`, buffer);
    });
  });

  describe('streamFile', () => {
    it('should return a stream and mime type if file exists and found', () => {
      (fsExtra.existsSync as jest.Mock).mockReturnValue(true);
      (mime.lookup as jest.Mock).mockReturnValue('image/png');
      const mockStream = {};
      (createReadStream as jest.Mock).mockReturnValue(mockStream);

      const [stream, mimeType] = provider.streamFile(['folder', 'file.png']);
      expect(fsExtra.existsSync).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}folder${path.sep}file.png`);
      expect(createReadStream).toHaveBeenCalledWith(`${VOLUME_PATH}${path.sep}folder${path.sep}file.png`);
      expect(mimeType).toBe('image/png');
      expect(stream).toBe(mockStream);
    });

    it('should return default mime type if lookup returns false', () => {
      (fsExtra.existsSync as jest.Mock).mockReturnValue(true);
      (mime.lookup as jest.Mock).mockReturnValue(false);
      (createReadStream as jest.Mock).mockReturnValue({});

      const [, mimeType] = provider.streamFile(['folder', 'file.bin']);
      expect(mimeType).toBe('application/octet-stream');
    });

    it('should throw NotFoundException if file does not exist', () => {
      (fsExtra.existsSync as jest.Mock).mockReturnValue(false);
      expect(() => provider.streamFile(['folder', 'file.bin'])).toThrow(
        new NotFoundException(LOCALE.FILE_WAS_NOT_FOUND)
      );
    });
  });

  describe('private helpers', () => {
    it('getVolume should return path from config', () => {
      const result = (provider as any).getVolume();
      expect(result).toBe(VOLUME_PATH);
      expect(mockConfig.getOrThrow).toHaveBeenCalledWith('file-storage.path');
    });

    it('joinVolumePath should join volume with relative path', () => {
      const result = (provider as any).joinVolumePath(['a', 'b']);
      expect(result).toBe(`${VOLUME_PATH}${path.sep}a${path.sep}b`);
    });
  });
});
