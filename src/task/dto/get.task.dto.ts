import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { GetProjectShortDto } from 'src/project/dto/get.project.dto';
import { GetUserDto } from 'src/user/dto/get.user.dto';

export class GetTaskShortDto {
  @ApiProperty({ name: 'id', default: 'number' })
  id: number;

  @ApiProperty({ name: 'title', default: 'string' })
  title: string;

  @ApiProperty({ name: 'description', default: 'string' })
  description: string;

  @ApiProperty({ name: 'start_date', default: 'date' })
  start_date: Date;

  @ApiProperty({ name: 'end_date', default: 'date' })
  end_date: Date;

  @ApiProperty({ name: 'project_id', default: 'number' })
  project_id: number;

  @ApiProperty({ name: 'project' })
  project: Partial<GetProjectShortDto>;

  // @ApiProperty({ name: 'project' })
  // project: GetProjectShortDto;

  @ApiProperty({ name: 'reviewer_id', default: 'number' })
  reviewer_id: number;

  @ApiProperty({ name: 'executor_id', default: 'number' })
  executor_id: number;

  @ApiProperty({ name: 'status', enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ name: 'hours', default: 'number' })
  hours: number;

  @ApiProperty({ name: 'comoment', default: 'number' })
  comment: string;
}

export class GetTaskAllInfoDto {
  @ApiProperty({ name: 'id', default: 'number' })
  id: number;

  @ApiProperty({ name: 'title', default: 'string' })
  title: string;

  @ApiProperty({ name: 'description', default: 'string' })
  description: string;

  @ApiProperty({ name: 'start_date', default: 'date' })
  start_date: Date;

  @ApiProperty({ name: 'end_date', default: 'date' })
  end_date: Date;

  @ApiProperty({ name: 'project_id', default: 'number' })
  project_id: number;

  @ApiProperty({ name: 'project' })
  project: Partial<GetProjectShortDto>;

  @ApiProperty({ name: 'reviewer_id', default: 'number' })
  reviewer_id: number;

  @ApiProperty({ name: 'reviewer' })
  reviewer: GetUserDto;

  @ApiProperty({ name: 'executor_id', default: 'number' })
  executor_id: number;

  @ApiProperty({ name: 'executor' })
  executor: GetUserDto;

  @ApiProperty({ name: 'status', enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ name: 'hours', default: 'number' })
  hours: number;

  @ApiProperty({ name: 'comoment', default: 'number' })
  comment: string;
}
