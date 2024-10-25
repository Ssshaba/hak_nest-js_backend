import { ApiProperty } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ default: 'Имя', required: false })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({ default: 'Фамилия', required: false })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({ default: 'Отчество', required: false })
  @IsOptional()
  @IsString()
  middleName: string;

  @ApiProperty({
    default: 'Логин для аутентификации',
    required: false,
    minLength: 3,
  })
  @ApiProperty({ default: 'Номер телефона', required: false })
  @IsString()
  @IsPhoneNumber('RU')
  @IsOptional()
  phone: string;

  @ApiProperty({ default: 'Телеграмм', required: false })
  @IsOptional()
  telegram: string;

  @ApiProperty({
    default: 'Адрес электронной почты',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ default: 'Логин' })
  @IsOptional()
  @IsString()
  login: string;

  @ApiProperty({ default: 'Роль', required: false })
  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ default: 'number' })
  @IsOptional()
  @IsNumber()
  rate: number;

  @ApiProperty({ default: 'Статус', required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty({ default: 'string', required: false })
  @IsOptional()
  @IsString()
  direction: string;

  @ApiProperty({
    default: 'Передаем названия компетенций через запятую и пробел ", "',
    required: false,
  })
  @IsOptional()
  @IsString()
  competencies: string;

  @ApiProperty({ default: 'Учебная группа', required: false })
  @IsOptional()
  @IsString()
  study_group: string;

  @ApiProperty({ default: 'Планы', required: false })
  @IsOptional()
  @IsString()
  plans: string;

  @ApiProperty({ default: 'Информация', required: false })
  @IsOptional()
  @IsString()
  about: string;

  @ApiProperty({
    default: 'Портфолио',
    required: false,
  })
  @IsOptional()
  @IsString()
  portfolio: string;

  @ApiProperty({ default: 'Должность' })
  @IsOptional()
  @IsString()
  position: string;

  @ApiProperty({ default: 'Заметка', required: false })
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
  npd_reference: string;
}

export class UpdateUserPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPasswordConfirm: string;
}

export class ConfirmOldPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;
}
