import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "An Email is required" })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password: string;
}