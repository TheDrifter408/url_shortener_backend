import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from 'src/constants';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  // Helper function to generate access and refresh tokens
  async getTokens(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      // 1. The access token
      this.jwtService.signAsync(payload),
      // 2. The refresh token that uses a different secret key
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d'
      })
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  async updateHashedRefreshToken(userId: number, token: string | null) {
    let hashedRefreshToken: string | null = null;

    if (token) {
      hashedRefreshToken = await bcrypt.hash(token, BCRYPT_SALT_ROUNDS);
    }

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashed_refresh_token: hashedRefreshToken
      }
    });

  }

  async signup(createUserDto: CreateUserDto) {
    const found = await this.prismaService.user.findFirst({
      where: {
        email: createUserDto.email,
      }
    });

    if (!found) {
      const hashed = await bcrypt.hash(createUserDto.password, BCRYPT_SALT_ROUNDS);
      const user = await this.prismaService.user.create({
        data: {
          email: createUserDto.email,
          password_hash: hashed,
          subscription_level: 'free',
        }
      });
      const { access_token, refresh_token } = await this.getTokens(user.id, user.email);

      await this.updateHashedRefreshToken(user.id, refresh_token);

      const userObj = {
        id: user.id,
        email: user.email,
        subscription_level: user.subscription_level,
      }

      return {
        refresh_token,
        access_token,
        user: userObj
      }
    } else {
      throw new HttpException("This email already exists", HttpStatus.CONFLICT);
    }

  }

  async signin(createUserDto: CreateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: createUserDto.email,
      }
    });
    if (user) {
      const comparedPassword = await bcrypt.compare(createUserDto.password, user.password_hash);
      if (comparedPassword) {

        const userObj = {
          id: user.id,
          email: user.email,
          subscription_level: user.subscription_level,
        }

        const { access_token, refresh_token } = await this.getTokens(user.id, user.email);

        await this.updateHashedRefreshToken(user.id, refresh_token);

        return {
          access_token,
          refresh_token,
          user: userObj
        }
      } else {
        throw new HttpException("Invalid Credentials", HttpStatus.UNAUTHORIZED);
      }
    }
  }

  async logout(userId: number) {
    await this.updateHashedRefreshToken(userId, null);
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

  async refreshTokens(userId: number, rt: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      }
    });

    if (!user || !user.hashed_refresh_token) {
      throw new ForbiddenException('Access Denied');
    }

    const rtMatches = await bcrypt.compare(rt, user.hashed_refresh_token);

    if (!rtMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);

    await this.updateHashedRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }
}
