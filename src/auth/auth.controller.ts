import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('/signin')
  async signin(@Body() createUserDto: CreateUserDto) {
    return this.authService.signin(createUserDto);
  }

  async findUser(email: string, userId?: number) {
    return this.authService.findUser(email, userId);
  }

}
