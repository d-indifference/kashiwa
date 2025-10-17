import { Injectable } from '@nestjs/common';
import { CommentMapper } from '@persistence/mappers/comment.mapper';
import { Report } from '@prisma/client';
import { ReportDto } from '@persistence/dto/report';

/**
 * Mappings for `Report` model
 */
@Injectable()
export class ReportMapper {
  constructor(private readonly commentMapper: CommentMapper) {}

  /**
   * Map model to DTO
   * @param model Prisma `Report` model
   */
  public toDto(model: Report): ReportDto {
    return {
      id: model.id,
      createdAt: model.createdAt,
      reportType: model.reportType,
      comment: this.commentMapper.toModerationDto(model['comment'])
    };
  }
}
