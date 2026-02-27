import { Controller, Post, Body, Res, UnauthorizedException, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RequestUser } from './types/JwtPayload';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) { }

  @Post('/signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.signup(createUserDto);

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const accessTokenMaxAge = Number(this.configService.get('JWT_ACCESS_TOKEN_MAX_AGE'));
    const refreshTokenMaxAge = Number(this.configService.get('JWT_REFRESH_TOKEN_MAX_AGE'));

    if (result) {
      const { access_token, refresh_token, user } = result;

      response.cookie('access_token', access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: accessTokenMaxAge, // 15 minutes
      });

      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: refreshTokenMaxAge, // 7 days
      });

      return {
        message: "Sign up Successfull",
        user,
      }
    }
  }

  @Post('/signin')
  async signin(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.signin(createUserDto);

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const accessTokenMaxAge = Number(this.configService.get('JWT_ACCESS_TOKEN_MAX_AGE'));
    const refreshTokenMaxAge = Number(this.configService.get('JWT_REFRESH_TOKEN_MAX_AGE'));

    if (!result) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (result) {
      const { access_token, refresh_token, user } = result;

      response.cookie('access_token', access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: accessTokenMaxAge, // 15 minutes
      });

      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: refreshTokenMaxAge, // 7 days
      });
      return user;
    }
  }

  async findUser(email: string, userId?: number) {
    return this.authService.findUser(email, userId);
  }

  @Post('/refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(
    @Req() req: { user: RequestUser & { refreshToken: string } },
    @Res({ passthrough: true }) res: Response
  ) {
    const { refresh_token, access_token } = await this.authService.refreshTokens(req.user.id, req.user.refreshToken);

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const accessTokenMaxAge = Number(this.configService.get('JWT_ACCESS_TOKEN_MAX_AGE'));
    const refreshTokenMaxAge = Number(this.configService.get('JWT_REFRESH_TOKEN_MAX_AGE'));

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: accessTokenMaxAge,
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge,
    });

    return {
      success: true,
      message: 'tokens refreshed'
    };
  }

  @Post('/reset-password')
  async resetPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.resetPassword(forgotPasswordDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@Req() req) {
    return {
      id: req.user.id,
      email: req.user.email,
    }
  }

}
