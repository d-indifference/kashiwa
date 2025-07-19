import { Injectable } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { PinoLogger } from 'nestjs-pino';

/**
 * Database queries for `Comment` model
 */
@Injectable()
export class AttachedFilePersistenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(AttachedFilePersistenceService.name);
  }
}
