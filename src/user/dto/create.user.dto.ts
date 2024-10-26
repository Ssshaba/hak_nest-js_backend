import { ApiProperty } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    default: 'Логин(адрес электронной почты)',
    required: false,
  })
  @IsString()
  @IsEmail()
  login: string;

  @ApiProperty({ default: 'Имя' })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({ default: 'Фамилия' })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({ default: 'Отчество' })
  @IsOptional()
  @IsString()
  middleName: string;

  /*@ApiProperty({ default: 'string' })
  @IsOptional()
  @IsString()
  direction: string;

  @ApiProperty({ default: 'Номер телефона' })
  @IsOptional()
  @IsPhoneNumber('RU')
  phone: string;

  @ApiProperty({ default: 'Телеграмм' })
  @IsOptional()
  @IsString()
  telegram: string;

  @ApiProperty({
    default: 'Адрес электронной почты',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ default: 'Роль' })
  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ default: 'Статус' })
  @IsOptional()
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty({ default: 'Учебная группа' })
  @IsOptional()
  @IsString()
  study_group: string;

  @ApiProperty({ default: 'Планы' })
  @IsOptional()
  @IsString()
  plans: string;

  @ApiProperty({ default: 'Должность' })
  @IsOptional()
  @IsString()
  position: string;

  @ApiProperty({ default: 'Информация' })
  @IsOptional()
  @IsString()
  about: string;

  @ApiProperty({
    default: 'Портфолио',
  })
  @IsOptional()
  @IsString()
  portfolio: string;

  @ApiProperty({ default: 'number' })
  @IsOptional()
  @IsNumber()
  rate: number;

  @ApiProperty({ default: 'Заметка' })
  @IsOptional()
  @IsString()
  note: string;

  @ApiProperty({ name: 'inn', default: 'string' })
  @IsOptional()
  @IsString()
  inn: string;

  @ApiProperty({ name: 'snils', default: 'string' })
  @IsOptional()
  @IsString()
  snils: string;

  @ApiProperty({ name: 'birthday', default: 'string' })
  @IsOptional()
  @IsString()
  birthday: string;

  @ApiProperty({ name: 'passport_data', default: 'string' })
  @IsOptional()
  @IsString()
  passport_data: string;

  @ApiProperty({ name: 'registration_address', default: 'string' })
  @IsOptional()
  @IsString()
  registration_address: string;

  @ApiProperty({ name: 'living_address', default: 'string' })
  @IsOptional()
  @IsString()
  living_address: string;

  @ApiProperty({ name: 'requisites', default: 'string' })
  @IsOptional()
  @IsString()
  requisites: string;

  @ApiProperty({ name: 'npd_reference', default: 'string' })
  @IsOptional()
  @IsString()
  npd_reference: string;*/
}
