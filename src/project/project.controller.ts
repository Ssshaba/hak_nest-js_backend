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
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create.project.dto';
import {
  GetProjectAllInfoDto,
  GetProjectListItem,
  GetProjectShortDto,
} from './dto/get.project.dto';
import { UpdateProjectDto } from './dto/update.project.dto';
import { ProjectStage } from './enum/stage';
import { Public } from 'src/auth/guards/public.guard';

@UseGuards(RolesGuard)
@ApiTags('Project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.SPECIALIST, Role.GUEST)
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
    description: 'Строка, по которой будет осуществляться поиск',
  })
  @ApiQuery({
    name: 'stage',
    enum: ProjectStage,
    required: true,
    description: 'Передаем стадию для проектов, чтобы фильтровать их',
  })
  @ApiResponse({ type: [GetProjectShortDto] })
  async getAllProjects(
    @Query('fields') fields: string,
    @Query('order_desc') desc: string,
    @Query('stage') stage: ProjectStage,
    @Query('search') search: string,
    @Req() req,
  ): Promise<Partial<GetProjectShortDto>[]> {
    const { id, role } = req.user;
    return this.projectService.getAllProjects(
      fields,
      desc,
      search,
      stage,
      +id,
      role,
    );
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.SPECIALIST, Role.CUSTOMER, Role.GUEST)
  @Get('/list')
  @ApiQuery({ name: 'title', type: String, required: false })
  @ApiOperation({
    description: 'Получение списков проектов для отображения выпадающего листа',
  })
  @ApiResponse({ type: [GetProjectListItem] })
  async getList(@Query('title') title: string, @Req() req) {
    const { id, role } = req.user;
    return this.projectService.getProjectsList(title, role, +id);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.SPECIALIST, Role.GUEST)
  @Get('/:id')
  @ApiResponse({ type: GetProjectAllInfoDto })
  @ApiParam({ name: 'id', required: true })
  async getProjectById(@Param('id') id: string): Promise<GetProjectAllInfoDto> {
    return this.projectService.getProjectById(+id);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @Post('')
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ type: GetProjectAllInfoDto })
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<GetProjectAllInfoDto> {
    return this.projectService.createProject(createProjectDto);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.SPECIALIST, Role.GUEST)
  @Patch('/:id')
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ type: GetProjectAllInfoDto })
  @ApiBody({ type: UpdateProjectDto })
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<GetProjectAllInfoDto> {
    return this.projectService.updateProject(+id, updateProjectDto);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @Delete('/:id')
  @ApiResponse({ type: Boolean })
  @ApiParam({ name: 'id', required: true })
  async deleteProject(@Param('id') id: string): Promise<Boolean> {
    return this.projectService.deleteProject(+id);
  }
}
