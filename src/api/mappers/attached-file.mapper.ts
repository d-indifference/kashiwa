import { Injectable } from '@nestjs/common';
import { AttachedFileDto as PersistenceAttachedFileDto } from '@persistence/dto/comment/common';
import { AttachedFileDto } from '@api/dto/v1';
import { Constants } from '@library/constants';
import { plainToInstance } from 'class-transformer';

/**
 * Mapper for `AttachedFile` object
 */
@Injectable()
export class AttachedFileMapper {
  /**
   * Mapping from persistence object to REST API DTO
   * @param attachedFile `AttachedFile` persistence object
   * @param boardUrl URL of board
   */
  public toApiDto(attachedFile: PersistenceAttachedFileDto | null, boardUrl: string): AttachedFileDto | null {
    if (!attachedFile) {
      return null;
    }

    const plain: AttachedFileDto = {
      size: attachedFile.size,
      width: attachedFile.width,
      height: attachedFile.height,
      mime: attachedFile.mime,
      isImage: attachedFile.isImage,
      isVideo: attachedFile.isVideo,
      thumbnailWidth: attachedFile.thumbnailWidth,
      thumbnailHeight: attachedFile.thumbnailHeight,
      path: `/${boardUrl}/${Constants.SRC_DIR}/${attachedFile.name}`,
      thumbnailPath: attachedFile.thumbnail ? `/${boardUrl}/${Constants.THUMB_DIR}/${attachedFile.thumbnail}` : null
    };

    return plainToInstance(AttachedFileDto, plain);
  }
}
