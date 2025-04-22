import { Injectable } from '@nestjs/common';
import { UserMapper } from '@persistence/mappers/user.mapper';
import { Ban, Prisma, User } from '@prisma/client';
import { BanCreateDto, BanDto } from '@persistence/dto/ban';
import { DateTime } from 'luxon';
import { UserDto } from '@persistence/dto/user';

/**
 * Mapping of `Ban` model
 */
@Injectable()
export class BanMapper {
  constructor(private readonly userMapper: UserMapper) {}

  /**
   * Mapping of `Ban` model to DTO
   * @param ban `Ban` model
   * @param user `User` model
   */
  public toDto(ban: Ban, user: User | null): BanDto {
    let userDto: UserDto | null = null;

    if (user) {
      userDto = this.userMapper.toDto(user);
    }

    return new BanDto(ban.id, ban.createdAt, ban.ip, ban.till, ban.reason, userDto);
  }

  /**
   * Mapping of `Ban` creation DTO to Prisma CreateInput
   * @param userId `Ban` model
   * @param dto `User` model
   */
  public create(userId: string, dto: BanCreateDto): Prisma.BanCreateInput {
    return {
      ip: dto.ip,
      till: this.mapDateTill(dto),
      reason: dto.reason,
      user: { connect: { id: userId } }
    };
  }

  /**
   * Mapping ban time to datetime
   */
  private mapDateTill(dto: BanCreateDto): Date {
    let now = DateTime.now();
    const duration: Record<string, number> = {};
    duration[dto.timeUnit] = dto.timeValue;
    now = now.plus(duration);

    return now.toJSDate();
  }
}
