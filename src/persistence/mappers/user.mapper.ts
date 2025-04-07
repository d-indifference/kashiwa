import { Injectable } from '@nestjs/common';
import { UserCreateDto, UserDto } from '@persistence/dto/user';
import { Prisma, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserMapper {
  constructor(private readonly config: ConfigService) {}

  public async create(dto: UserCreateDto): Promise<Prisma.UserCreateInput> {
    return {
      username: dto.username,
      email: dto.username,
      role: dto.role,
      passwordHash: await bcrypt.hash(dto.password, this.config.getOrThrow<number>('secure.user.salt-rounds'))
    };
  }

  public toDto(input: User): UserDto {
    return new UserDto(input.id, input.username, input.email, input.role);
  }
}
