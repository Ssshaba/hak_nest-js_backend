import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTaskDto {
  @ApiProperty({ name: 'title', default: 'string' })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ name: 'description', default: 'string' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ name: 'start_date' })
  @IsOptional()
  @IsDateString()
  start_date: Date;

  @ApiProperty({ name: 'end_date' })
  @IsOptional()
  @IsDateString()
  end_date: Date;

  @ApiProperty({ name: 'project_id', default: 'number' })
  @IsOptional()
  @IsNumber()
  project_id: number;

  @ApiProperty({ name: 'reviewer_id', default: 'number' })
  @IsOptional()
  @IsNumber()
  reviewer_id: number;

  @ApiProperty({ name: 'executor_id', default: 'number' })
  @IsOptional()
  @IsNumber()
  executor_id: number;

  @ApiProperty({ name: 'status', enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty({ name: 'hours', default: 'number' })
  @IsOptional()
  @IsNumber()
  hours: number;

  @ApiProperty({ name: 'comoment', default: 'string' })
  @IsOptional()
  @IsString()
  comment: string;
}
