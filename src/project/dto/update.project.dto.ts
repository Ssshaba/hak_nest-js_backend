import { ApiProperty } from '@nestjs/swagger';
import { StatusesForProject } from '@prisma/client';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({ name: 'title' })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ name: 'owner_id', default: 'number' })
  @IsOptional()
  @IsNumber()
  owner_id: number;

  @ApiProperty({ name: 'customer', default: 'string' })
  @IsOptional()
  @IsString()
  customer: string;

  @ApiProperty({ name: 'contact_person', default: 'string' })
  @IsOptional()
  @IsString()
  contact_person: string;

  @ApiProperty({ name: 'contact_data', default: 'string' })
  @IsOptional()
  @IsString()
  contact_data: string;

  @ApiProperty({ name: 'director', default: 'string' })
  @IsOptional()
  @IsString()
  director: string;

  @ApiProperty({ name: 'status', enum: StatusesForProject })
  @IsOptional()
  @IsString()
  status: StatusesForProject;

  @ApiProperty({ name: 'start_date' })
  @IsOptional()
  @IsDateString()
  start_date: Date;

  @ApiProperty({ name: 'end_date' })
  @IsOptional()
  @IsDateString()
  end_date: Date;

  @ApiProperty({ name: 'description', default: 'string' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ name: 'technical_task', default: 'string' })
  @IsOptional()
  @IsString()
  technical_task: string;

  @ApiProperty({ name: 'contract', default: 'string' })
  @IsOptional()
  @IsString()
  contract: string;

  @ApiProperty({ name: 'contract_date', default: 'date' })
  @IsOptional()
  @IsDateString()
  contract_date: Date;

  @ApiProperty({ name: 'service_name', default: 'string' })
  @IsOptional()
  @IsString()
  service_name: string;

  @ApiProperty({ name: 'document_number', default: 'number' })
  @IsOptional()
  @IsString()
  document_number: number;

  @ApiProperty({ name: 'comment' })
  @IsOptional()
  @IsString()
  comment: string;

  @ApiProperty({ name: 'organization_id' })
  @IsOptional()
  @IsNumber()
  organization_id: number;

  @ApiProperty({ name: 'tasks', default: [] })
  @IsOptional()
  @IsArray()
  tasks: number[];

  @ApiProperty({ name: 'users', default: [] })
  @IsOptional()
  @IsArray()
  users: number[];
}
