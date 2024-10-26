import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({ name: 'login', default: 'string' })
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty({ name: 'password', default: 'string' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
