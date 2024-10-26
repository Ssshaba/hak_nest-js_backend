import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { GetUserDto } from 'src/user/dto/get.user.dto';
import { GetTaskShortDto } from 'src/task/dto/get.task.dto';
import { CreateProjectDto } from './create.project.dto';
import { StatusesForProject } from '@prisma/client';

export class GetProjectShortDto {
  @ApiProperty({ name: 'id', default: 'number' })
  id: number;

  @ApiProperty({ name: 'title', default: 'string' })
  title: string;

  @ApiProperty({ name: 'customer', default: 'string' })
  customer: string;

  @ApiProperty({ name: 'status', enum: StatusesForProject })
  status: StatusesForProject;

  @ApiProperty({ name: 'start_date' })
  start_date: Date;

  @ApiProperty({ name: 'end_date' })
  end_date: Date;

  @ApiProperty({ name: 'contact_person', default: 'string' })
  contact_person: string;

  @ApiProperty({ name: 'contact_data', default: 'string' })
  contact_data: string;

  @ApiProperty({ name: 'director', default: 'string' })
  director: string;

  @ApiProperty({ name: 'description', default: 'string' })
  description: string;

  @ApiProperty({ name: 'technical_task', default: 'string' })
  technical_task: string;

  @ApiProperty({ name: 'contract', default: 'string' })
  @IsOptional()
  contract: string;

  @ApiProperty({ name: 'contract_date', default: 'date' })
  @IsOptional()
  contract_date: Date;

  @ApiProperty({ name: 'service_name', default: 'string' })
  @IsOptional()
  service_name: string;

  @ApiProperty({ name: 'document_number', default: 'number' })
  @IsOptional()
  document_number: number;

  @ApiProperty({ name: 'owner_id' })
  owner_id: number;

  @ApiProperty({ name: 'organization_id' })
  organization_id: number;

  @ApiProperty({ name: 'comment' })
  comment: string;

  @ApiProperty({ name: 'users', required: false })
  users: GetUserDto[];
}

export class GetProjectAllInfoDto extends GetProjectShortDto {
  @ApiProperty({ name: 'owner' })
  owner: GetUserDto;

  @ApiProperty({ name: 'tasks' })
  tasks: Partial<GetTaskShortDto>[];

  @ApiProperty({ name: 'users' })
  users: GetUserDto[];
}

export class GetProjectListItem {
  @ApiProperty({ name: 'id' })
  id: number;

  @ApiProperty({ name: 'title' })
  title: string;
}
