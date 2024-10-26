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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create.task.dto';
import { UpdateTaskDto } from './dto/update.task.dto';
import { GetTaskAllInfoDto, GetTaskShortDto } from './dto/get.task.dto';

@UseGuards(RolesGuard)
@ApiTags('Task')
@Controller('task')
export class TaskController {
  constructor(private readonly taskServcie: TaskService) {}

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.SPECIALIST)
  @Get('')
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
    name: 'search',
    required: false,
    description: 'Передается строка, по которой будет осуществляться поиск',
  })
  @ApiResponse({ type: [GetTaskShortDto] })
  async getAllTasks(
    @Query('fields') fields: string,
    @Query('order_desc') desc: string,
    @Query('search') search: string,
    @Req() req,
  ): Promise<Partial<GetTaskShortDto>[]> {
    const { id, role } = req.user;
    return this.taskServcie.getAllTasks(fields, desc, search, role, id);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.SPECIALIST)
  @Get('by-project/:id')
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
    name: 'search',
    required: false,
    description: 'Передается строка, по которой будет осуществляться поиск',
  })
  @ApiResponse({ type: [GetTaskShortDto] })
  async getAllTasksForProject(
    @Query('fields') fields: string,
    @Query('order_desc') desc: string,
    @Query('search') search: string,
    @Param('id') projectId: string,
    @Req() req,
  ): Promise<Partial<GetTaskShortDto>[]> {
    const { id, role } = req.user;
    return this.taskServcie.getAllTasksForProject(
      fields,
      desc,
      search,
      role,
      id,
      +projectId,
    );
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.SPECIALIST, Role.CUSTOMER)
  @Get('/:id')
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ type: GetTaskAllInfoDto })
  async getTaskById(@Param('id') id: string): Promise<GetTaskAllInfoDto> {
    return this.taskServcie.getTaskById(+id);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.SPECIALIST, Role.CUSTOMER)
  @Post('')
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ type: GetTaskAllInfoDto })
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<GetTaskAllInfoDto> {
    return this.taskServcie.createTask(createTaskDto);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.SPECIALIST, Role.CUSTOMER)
  @Patch('/:id')
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ type: GetTaskAllInfoDto })
  @ApiBody({ type: UpdateTaskDto })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<GetTaskAllInfoDto> {
    return this.taskServcie.updateTask(+id, updateTaskDto);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.SPECIALIST, Role.CUSTOMER)
  @Delete('/:id')
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ type: Boolean })
  async deleteTask(@Param('id') id: string): Promise<Boolean> {
    return this.taskServcie.deleteTask(+id);
  }
}
