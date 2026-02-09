// 注册 DTO
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nickname: string;

  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;
}
