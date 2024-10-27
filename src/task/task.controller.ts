import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req, Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody, ApiOperation,
  ApiParam, ApiProduces,
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
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.SPECIALIST, Role.GUEST)
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
  @ApiQuery({
    name: 'onlyMyTasks',
    required: false,
    type: Boolean,
    description: 'Если true, будут возвращены только задачи текущего пользователя',
  })
  @ApiResponse({ type: [GetTaskShortDto] })
  async getAllTasksForProject(
    @Query('fields') fields: string,
    @Query('order_desc') desc: string,
    @Query('search') search: string,
    @Query('onlyMyTasks') onlyMyTasks: boolean,
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
      onlyMyTasks,
  );
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.SPECIALIST, Role.CUSTOMER, Role.GUEST)
  @Get('/:id')
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ type: GetTaskAllInfoDto })
  async getTaskById(@Param('id') id: string): Promise<GetTaskAllInfoDto> {
    return this.taskServcie.getTaskById(+id);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.SPECIALIST, Role.CUSTOMER, Role.GUEST)
  @Post('')
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ type: GetTaskAllInfoDto })
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<GetTaskAllInfoDto> {
    return this.taskServcie.createTask(createTaskDto);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.SPECIALIST, Role.CUSTOMER, Role.GUEST)
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
  @Roles(Role.ADMIN, Role.SPECIALIST, Role.CUSTOMER, Role.GUEST)
  @Delete('/:id')
  @ApiOperation({ summary: 'Удаление таски' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ type: Boolean })
  async deleteTask(@Param('id') id: string): Promise<Boolean> {
    return this.taskServcie.deleteTask(+id);
  }

 /* @Get('export/:projectId')
  async exportTasksToExcel(@Param('projectId') projectId: number, @Res() res:any) {
    try {
      const fileUrl = await this.taskServcie.exportTasksToExcel(projectId);
      res.send({ downloadUrl: fileUrl });
    } catch (error) {
      res.status(500).send('Ошибка при экспорте задач');
    }
  }*/

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.SPECIALIST, Role.CUSTOMER, Role.GUEST)
  @Get('export/:projectId')
  @ApiOperation({ summary: 'Экспорт задач проекта в Excel' })
  @ApiParam({
    name: 'projectId',
    required: true,
    description: 'ID проекта, для которого необходимо экспортировать задачи',
    schema: { type: 'integer' },
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'CCылка для скачивания файла с задачами',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: { type: 'string', example: 'https://storage.example.com/file.xlsx' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Ошибка при экспорте задач' })
  async exportTasksToExcel(@Param('projectId') projectId: number, @Res() res: any) {
    try {
      const fileUrl = await this.taskServcie.exportTasksToExcel(projectId);
      res.send({ downloadUrl: fileUrl });
    } catch (error) {
      res.status(500).send('Ошибка при экспорте задач');
    }
  }
}
