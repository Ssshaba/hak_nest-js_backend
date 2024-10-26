import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiTags,
  PartialType,
} from '@nestjs/swagger';
import { GetUserAllInfoDto, GetUserDto } from 'src/user/dto/get.user.dto';
import { CreateUserDto } from 'src/user/dto/create.user.dto';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth.dto';
import { Public } from './guards/public.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { GetAuthDto } from './dto/get.auth.dto';

@UseGuards(RolesGuard)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  @ApiBody({ type: AuthLoginDto })
  async authLogin(
    @Body() authLoginDto: AuthLoginDto,
  ): Promise<Partial<GetAuthDto>> {
    return this.authService.signIn(authLoginDto);
  }

  @Public()
  @Post('/register')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ type: Boolean })
  async registerUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<GetUserDto> {
    return this.authService.registerUser(createUserDto);
  }

  @ApiBearerAuth('auth')
  @Get('data')
  @ApiResponse({ type: PartialType<GetUserAllInfoDto> })
  async getProfile(@Req() req): Promise<Partial<GetUserAllInfoDto>> {
    return req.user;
  }
}
