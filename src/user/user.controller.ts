import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/guards/public.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.user.dto';
import {
  ConfirmOldPasswordDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from './dto/update.user.dto';
import {
  GetUserAllInfoDto,
  GetUserDto,
  GetUserListItem,
} from './dto/get.user.dto';
import { InternshipsStage } from './enum/InternshipEnum';

@UseGuards(RolesGuard)
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @ApiQuery({
    name: 'fields',
    required: false,
    description:
      'Передаются название полей, которые будут возвращены после запроса',
  })
  @ApiQuery({
    name: 'order_desc',
    required: false,
    description:
      'Передаются названия полей, на основе которых будет осуществлена сортировка в обратном порядке, по умолчанию для всех полей установлена сортировка в прямом порядке',
  })
  @ApiQuery({
    name: 'status',
    enum: UserStatus,
    required: false,
    description:
      'Выбираем статус пользователя, чтобы получить либо Специалистов, либо Стажеров, либо Практикантов',
  })
  @ApiQuery({
    name: 'stage',
    required: false,
    enum: InternshipsStage,
    description:
      'Передаем стадию для стажировок, для специалистов можно ничего не передавать, для них это никак не работает',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Значение, по которому будет проводиться поиск',
  })
  @ApiQuery({
    name: 'competencies',
    required: false,
    type: String,
    description: 'Компетенции, по которым будет происходить фильтация',
  })
  @Get('/status')
  async getUsersByStatus(
    @Query('status') status: UserStatus,
    @Query('fields') fields: string,
    @Query('order_desc') desc: string,
    @Query('stage') stage: InternshipsStage,
    @Query('search') search: string,
    @Query('competencies') competencies: string,
  ) {
    return this.userService.getUsersByStatus(
      status,
      fields,
      desc,
      stage,
      search,
      competencies,
    );
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @Get('/list')
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiResponse({ type: [GetUserListItem] })
  async getUsersList(
    @Query('search') search: string,
  ): Promise<GetUserListItem[]> {
    return this.userService.getUsersList(search);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @ApiQuery({
    name: 'role',
    required: true,
    enum: Role,
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description:
      'Передаются название полей, которые будут возвращены после запроса',
  })
  @ApiQuery({
    name: 'order_desc',
    required: false,
    description:
      'Передаются названия полей, на основе которых будет осуществлена сортировка в обратном порядке, по умолчанию для всех полей установлена сортировка в прямом порядке',
  })
  @Get('/role')
  @ApiResponse({ type: [GetUserDto] })
  async getUserByRole(
    @Query('role') role: Role,
    @Query('fields') fields: string,
    @Query('order_desc') desc: string,
  ): Promise<Partial<GetUserDto>[]> {
    return this.userService.getUserByRole(role, fields, desc);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.SPECIALIST)
  @ApiResponse({ type: GetUserAllInfoDto })
  @Get('/profile')
  async getProfileInfoById(@Req() req): Promise<Partial<GetUserAllInfoDto>> {
    const { id, status, role } = req.user;
    return this.userService.getProfileInfoById(+id, status, role);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @Get('/:id')
  @ApiParam({ type: Number, name: 'id', required: true })
  async getUserById(
    @Param('id') id: string,
  ): Promise<Partial<GetUserAllInfoDto>> {
    return this.userService.getUserById(+id);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.SPECIALIST)
  @ApiOperation({
    description:
      'Подтверждение старого пароля для пользователя (сначала подтверждаем старый пароль, если правильно, то вернет true, после этого уже обновляем пароль)',
  })
  @Post('/confirm-password')
  @ApiBody({ type: ConfirmOldPasswordDto })
  @ApiResponse({ type: Boolean })
  async confirmUserPassword(
    @Req() req,
    @Body() confirmOldPasswordDto: ConfirmOldPasswordDto,
  ): Promise<Boolean> {
    const { id } = req.user;
    return this.userService.confirmUserOldPassword(+id, confirmOldPasswordDto);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.SPECIALIST)
  @ApiOperation({ description: 'Обновление пароля пользователя' })
  @Patch('/password')
  @ApiBody({ type: UpdateUserPasswordDto })
  @ApiResponse({ type: Boolean })
  async updateUserPassword(
    @Req() req,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<Boolean> {
    const { id } = req.user;
    return this.userService.updateUserPassword(+id, updateUserPasswordDto);
  }

  @Public()
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ type: GetUserDto })
  @Post('')
  async createUser(@Body() userDto: CreateUserDto): Promise<GetUserDto> {
    return this.userService.createUser(userDto);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.SPECIALIST)
  @ApiOperation({ description: 'Обновление информации о пользователе' })
  @Patch('')
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ type: GetUserDto })
  async updateUser(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<GetUserDto> {
    const { id } = req.user;
    return this.userService.updateUser(+id, updateUserDto);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @ApiOperation({
    description: 'Обновление информации о пользователе для админа',
  })
  @Patch('/:id')
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ type: GetUserDto })
  async updateUserForAdmin(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
  ): Promise<GetUserDto> {
    return this.userService.updateUser(+id, updateUserDto);
  }

 /* @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ description: 'Удаление пользователя (только для Админа)' })
  @Delete('/:id')
  @ApiResponse({ type: Boolean })
  @ApiParam({ name: 'id' })
  async deleteUserById(@Param('id') id: string): Promise<Boolean> {
    return this.userService.deleteUserById(+id);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.SPECIALIST)
  @ApiOperation({ description: 'Удаление пользователя (для пользователя)' })
  @ApiResponse({ type: Boolean })
  @Delete('')
  async deleteUser(@Req() req): Promise<Boolean> {
    const { id } = req.user;
    return this.userService.deleteUserById(+id);
  }*/
}
