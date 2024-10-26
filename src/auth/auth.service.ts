import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create.user.dto';
import { AuthLoginDto } from './dto/auth.dto';
import { GetAuthDto } from './dto/get.auth.dto';
import { GetUserDto } from 'src/user/dto/get.user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(authLoginDto: AuthLoginDto): Promise<Partial<GetAuthDto>> {
    const { login: authEmail, password: pass } = authLoginDto;
    const user = await this.userService.findUser(authEmail);
    if (!user) {
      throw new BadRequestException('INVALID USER');
    }
    const isCompare = await bcrypt.compare(pass, user.password);

    if (!isCompare) {
      throw new BadRequestException('ERROR USER DATA');
    }
    const {
      password,
      id,
      email,
      firstName,
      lastName,
      middleName,
      role,
      status,
      //organization,
      ...userData
    } = user;
    const userPayload: Partial<GetAuthDto> = {
      id,
      email,
      firstName,
      lastName,
      middleName,
      role,
      status,
    };
    /*if (role === 'CUSTOMER') {
      userPayload.organization_id = organization.id ?? null;
    }*/

    return {
      access_token: await this.jwtService.signAsync(userPayload),
      ...userPayload,
    };
  }

  async registerUser(createUserDto: CreateUserDto): Promise<GetUserDto> {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
