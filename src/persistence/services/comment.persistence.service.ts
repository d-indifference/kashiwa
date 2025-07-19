import { Injectable } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { PinoLogger } from 'nestjs-pino';

/**
 * Database queries for `Comment` model
 */
@Injectable()
export class CommentPersistenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(CommentPersistenceService.name);
  }

  /**
   * Get all comments count
   */
  public async countAll(): Promise<number> {
    return (await this.prisma.comment.count()) as number;
  }
}
