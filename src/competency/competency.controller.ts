import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  PartialType,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CompetencyService } from './competency.service';
import { CreateCompetencyDto } from './dto/create.competency.dto';
import { UpdateCompetencyDto } from './dto/update.competency.dto';
import {
  GetCompetencyFullInfoDto,
  GetCompetencyShortDto,
  GetCompetencyTitleDto,
} from './dto/get.competency.dto';

@ApiTags('Competency')
@UseGuards(RolesGuard)
@Controller('competency')
export class CompetencyController {
  constructor(private readonly competencyService: CompetencyService) {}
  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @Get('')
  @ApiResponse({ type: [GetCompetencyShortDto] })
  async getAllCompetencies(): Promise<GetCompetencyShortDto[]> {
    return this.competencyService.getAllCompetencies();
  }

  @ApiOperation({
    description:
      'Получение названий компетенций, чтобы отобразить список для фильтраций пользователей по компетенциям',
  })
  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN, Role.SPECIALIST)
  @Get('/titles')
  @ApiResponse({ type: [GetCompetencyTitleDto] })
  async getAllCompetenciesTitles(): Promise<GetCompetencyTitleDto[]> {
    return this.competencyService.getAllCompetenciesTitles();
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @Get('/:id')
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ type: GetCompetencyFullInfoDto })
  async getCompetencyById(
    @Param('id') id: string,
  ): Promise<GetCompetencyFullInfoDto> {
    return this.competencyService.getCompetencyById(+id);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @Post('')
  @ApiBody({ type: CreateCompetencyDto })
  @ApiResponse({ type: GetCompetencyShortDto })
  async createCompetency(
    @Body() createCompetencyDto: CreateCompetencyDto,
  ): Promise<GetCompetencyShortDto> {
    return this.competencyService.createCompetency(createCompetencyDto);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @Patch('/:id')
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: UpdateCompetencyDto })
  @ApiResponse({ type: GetCompetencyFullInfoDto })
  async udpateCompetency(
    @Param('id') id: string,
    @Body() udpateCompetencyDto: UpdateCompetencyDto,
  ): Promise<GetCompetencyFullInfoDto> {
    return this.competencyService.udpateCompetency(+id, udpateCompetencyDto);
  }

  @ApiBearerAuth('auth')
  @Roles(Role.ADMIN)
  @Delete('/:id')
  @ApiResponse({ type: Boolean })
  @ApiParam({ name: 'id', required: true })
  async deleteCompetency(@Param('id') id: string): Promise<Boolean> {
    return this.competencyService.deleteCompetency(+id);
  }
}
