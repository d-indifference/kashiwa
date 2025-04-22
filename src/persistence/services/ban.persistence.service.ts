import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { BanMapper } from '@persistence/mappers';
import { Page, PageRequest } from '@persistence/lib/page';
import { BanCreateDto, BanDto } from '@persistence/dto/ban';
import { Ban, Prisma } from '@prisma/client';

/**
 * Database queries for `Ban` model
 */
@Injectable()
export class BanPersistenceService {
  private readonly logger: Logger = new Logger(BanPersistenceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly banMapper: BanMapper
  ) {}

  /**
   * Get page of bans by page request
   * @param page Page request
   */
  public async findAll(page: PageRequest): Promise<Page<BanDto>> {
    const entities = await Page.ofFilter<
      Ban,
      Prisma.BanWhereInput,
      Prisma.BanOrderByWithAggregationInput,
      Prisma.BanInclude
    >(this.prisma, 'ban', page, {}, { createdAt: 'desc' }, { user: true });

    return entities.map(entity => this.banMapper.toDto(entity, entity['user']));
  }

  /**
   * Get the current ban by IP. If the current ban of IP exists, returns ban, else returns `null`
   * @param ip Poster's IP
   */
  public async getCurrentBan(ip: string): Promise<BanDto | null> {
    const lastBan = await this.prisma.ban.findFirst({
      where: { ip },
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });

    if (!lastBan) {
      return null;
    }

    const now = new Date();

    if (lastBan.till > now) {
      return this.banMapper.toDto(lastBan, lastBan.user);
    }

    await this.deleteOldBans();

    return null;
  }

  /**
   * Create a new ban
   * @param userId Admin's ID
   * @param dto DTO with information of ban creation
   */
  public async create(userId: string, dto: BanCreateDto): Promise<BanDto> {
    this.logger.log(`create: userId: ${userId}, dto: ${JSON.stringify(dto)}`);

    const createInput = this.banMapper.create(userId, dto);

    const newBan = await this.prisma.ban.create({ data: createInput, include: { user: true } });

    await this.deleteOldBans();

    return this.banMapper.toDto(newBan, newBan.user);
  }

  /**
   * Remove a ban
   * @param id Ban ID
   */
  public async remove(id: string): Promise<void> {
    this.logger.log(`remove: id: ${id}`);

    await this.prisma.ban.delete({ where: { id } });
    await this.deleteOldBans();
  }

  /**
   * Deletion of old bans
   */
  private async deleteOldBans(): Promise<void> {
    await this.prisma.ban.deleteMany({ where: { till: { lt: new Date() } } });
  }
}
