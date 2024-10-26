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

export class CreateProjectDto {
  @ApiProperty({ name: 'title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ name: 'owner_id', default: 'number' })
  @IsOptional()
  @IsNumber()
  owner_id: number;

  @ApiProperty({ name: 'customer', default: 'Заказчик' })
  @IsNotEmpty()
  @IsString()
  customer: string;

  @ApiProperty({ name: 'contact_person', default: 'Контактное лицо(ФИО)' })
  @IsNotEmpty()
  @IsString()
  contact_person: string;

  @ApiProperty({ name: 'contact_data', default: 'Номер телефона контактного лица' })
  @IsNotEmpty()
  @IsString()
  contact_data: string;

  @ApiProperty({ name: 'start_date' })
  @IsOptional()
  @IsDateString()
  start_date: Date;

  @ApiProperty({ name: 'end_date' })
  @IsOptional()
  @IsDateString()
  end_date: Date;

  @ApiProperty({ name: 'description', default: 'string' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ name: 'contract', default: 'string' })
  @IsOptional()
  @IsString()
  contract: string;

  @ApiProperty({ name: 'contract_date', default: 'date' })
  @IsOptional()
  @IsDateString()
  contract_date: Date;

  @ApiProperty({ name: 'status', enum: StatusesForProject })
  @IsOptional()
  @IsString()
  status: StatusesForProject;

  @ApiProperty({ name: 'tasks', default: [] })
  @IsOptional()
  @IsArray()
  tasks: number[];

  @ApiProperty({ name: 'users', default: [] })
  @IsOptional()
  @IsArray()
  users: number[];
}
