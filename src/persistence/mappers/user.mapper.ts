import { Injectable } from '@nestjs/common';
import { UserCreateDto, UserDto, UserUpdateDto } from '@persistence/dto/user';
import { Prisma, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

/**
 * Mapper for `User` model
 */
@Injectable()
export class UserMapper {
  constructor(private readonly config: ConfigService) {}

  /**
   * Map creation DTO to Prisma creation input with password hashing.
   * @param dto Creation DTO
   */
  public async create(dto: UserCreateDto): Promise<Prisma.UserCreateInput> {
    return {
      username: dto.username,
      email: dto.email,
      role: dto.role,
      passwordHash: await bcrypt.hash(dto.password, this.config.getOrThrow<number>('secure.user.salt-rounds'))
    };
  }

  /**
   * Partially map updating DTO to Prisma update input with password hashing.
   * @param dto Creation DTO
   */
  public async update(dto: UserUpdateDto): Promise<Prisma.UserUpdateInput> {
    const input: Prisma.UserUpdateInput = {};

    input.username = dto.username;
    input.email = dto.email;
    input.role = dto.role;
    input.passwordHash = dto.password
      ? await bcrypt.hash(dto.password, this.config.getOrThrow<number>('secure.user.salt-rounds'))
      : undefined;

    return input;
  }

  /**
   * Map Prisma `User` model to DTO
   * @param input `User` Prisma model
   */
  public toDto(input: User): UserDto {
    return new UserDto(input.id, input.username, input.email, input.role);
  }
}
