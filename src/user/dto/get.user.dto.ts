import { ApiProperty } from '@nestjs/swagger';
import { GetCompetencyShortDto } from 'src/competency/dto/get.competency.dto';
import { GetInternshipDto } from 'src/internship/dto/get.internship.dto';
import { Role, UserStatus } from '@prisma/client';
import { GetTaskAllInfoDto, GetTaskShortDto } from 'src/task/dto/get.task.dto';
import { GetProjectShortDto } from 'src/project/dto/get.project.dto';
import { CreateUserDto } from './create.user.dto';
import { GetOrganizationShortDto } from 'src/organization/dto/get.organization.dto';

export class GetUserDto {
  @ApiProperty({ name: 'id', default: 'number' })
  id: number;

  @ApiProperty({ default: 'Имя' })
  firstName: string;

  @ApiProperty({ default: 'Фамилия' })
  lastName: string;

  @ApiProperty({ default: 'Отчество' })
  middleName: string;

  @ApiProperty({ default: 'string' })
  direction: string;

  @ApiProperty({ default: 'Номер телефона' })
  phone: string;

  @ApiProperty({ default: 'Телеграмм' })
  telegram: string;

  @ApiProperty({
    default: 'Адрес электронной почты',
    required: false,
  })
  email: string;

  @ApiProperty({ default: 'Логин' })
  login: string;

  @ApiProperty({ default: 'Роль' })
  role: Role;

  @ApiProperty({ default: 'Статус' })
  status: UserStatus;

  @ApiProperty({ default: 'Учебная группа' })
  study_group: string;

  @ApiProperty({ default: 'Планы' })
  plans: string;

  @ApiProperty({ default: 'Должность' })
  position: string;

  @ApiProperty({ default: 'Информация' })
  about: string;

  @ApiProperty({
    default: 'Портфолио',
  })
  portfolio: string;

  @ApiProperty({ default: 'number' })
  rate: number;

  @ApiProperty({ default: 'Заметка' })
  note: string;

  @ApiProperty({ name: 'inn', default: 'string' })
  inn: string;

  @ApiProperty({ name: 'snils', default: 'string' })
  snils: string;

  @ApiProperty({ name: 'birthday', default: 'string' })
  birthday: string;

  @ApiProperty({ name: 'passport_data', default: 'string' })
  passport_data: string;

  @ApiProperty({ name: 'registration_address', default: 'string' })
  registration_address: string;

  @ApiProperty({ name: 'living_address', default: 'string' })
  living_address: string;

  @ApiProperty({ name: 'requisites', default: 'string' })
  requisites: string;

  @ApiProperty({ name: 'npd_reference', default: 'string' })
  npd_reference: string;
}

export class GetUserForInternshipDto extends GetUserDto {
  @ApiProperty({ name: 'competencies', default: [{}] })
  competencies: GetCompetencyShortDto[];

  @ApiProperty({ name: 'internships', default: [{}] })
  internships: GetInternshipDto[];
}

export class GetUserAllInfoDto extends GetUserDto {
  @ApiProperty({ name: 'internships' })
  internships: GetInternshipDto[];

  @ApiProperty({ name: 'competencies' })
  competencies: GetCompetencyShortDto[];

  @ApiProperty({ name: 'tasks' })
  tasks: Partial<GetTaskAllInfoDto>[];

  @ApiProperty({ name: 'projects' })
  projects: Partial<GetProjectShortDto>[];

  @ApiProperty({ name: 'review_tasks' })
  review_tasks: Partial<GetTaskAllInfoDto>[];
}

export class GetUserAllInfoWithPasswordDto extends GetUserAllInfoDto {
  @ApiProperty({ name: 'password' })
  password: string;

  @ApiProperty({ name: 'organization' })
  organization: Partial<GetOrganizationShortDto>;
}

export class GetUserListItem {
  @ApiProperty({})
  id: number;

  @ApiProperty({})
  firstName: string;

  @ApiProperty({})
  lastName: string;

  @ApiProperty({})
  middleName: string;
}
