import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import  type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.signup(createUserDto);
    const isProduction = process.env.NODE_ENV === 'production';
    if (result) {
      const { access_token, refresh_token, user } = result;

      response.cookie('access_token', access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
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
    const isProduction = process.env.NODE_ENV === 'production';
    if (result) {
      const { access_token, refresh_token, user } = result;
      response.cookie('access_token', access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      return {
        message: "Login Successful",
        user
      }
    }
  }

  async findUser(email: string, userId?: number) {
    return this.authService.findUser(email, userId);
  }

}
