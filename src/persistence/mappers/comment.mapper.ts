import { Injectable } from '@nestjs/common';
import { Comment, AttachedFile } from '@prisma/client';
import { CommentDto, AttachedFileDto } from '@persistence/dto/comment';

@Injectable()
export class CommentMapper {
  constructor() {}

  public toDto(model: Comment, attachedFile: AttachedFile | null, children: Comment[]): CommentDto {
    const childrenDto: CommentDto[] = [];

    if (children.length > 0) {
      children.forEach(child => {
        childrenDto.push(this.toDto(child, child['attachedFile'], []));
      });
    }

    const attachedFileDto = this.attachedFileToDto(attachedFile);

    return new CommentDto(
      model.num,
      model.createdAt,
      model.isAdmin,
      model.name,
      model.tripcode,
      model.subject,
      model.comment,
      attachedFileDto,
      childrenDto
    );
  }

  public attachedFileToDto(model: AttachedFile | null): AttachedFileDto | null {
    if (!model) {
      return null;
    }

    return new AttachedFileDto(
      model.name,
      model.size,
      model.width,
      model.height,
      model.mime,
      model.isImage,
      model.thumbnail,
      model.thumbnailWidth,
      model.thumbnailHeight
    );
  }
}
