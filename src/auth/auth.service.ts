import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(private prismaService: PrismaService) {}

  async signup(createUserDto: CreateUserDto) {
    const found = await this.prismaService.user.findFirst({
      where: {
        email: createUserDto.email,
      }
    });

    if (!found) {
      const saltOrRounds = 10;
      const hashed = await bcrypt.hash(createUserDto.password, saltOrRounds);
      const user = await this.prismaService.user.create({
        data: {
          email: createUserDto.email,
          password_hash: hashed,
          subscription_level: 'free',
        }
      });
      return {
        email: user.email,

      }
    }


  }

  async signin(createUserDto: CreateUserDto) {
    return 'This action signs in a user';
  }

  async findUser(email: string, userId?: number) {
    if (userId) {
      const found = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        }
      });
      return found;
    }
    const found = await this.prismaService.user.findFirst({
      where: {
        email,
      }
    });
    return found;
  }


}
