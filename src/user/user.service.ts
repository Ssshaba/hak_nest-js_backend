import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma/prisma.service';
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create.user.dto';
import {
  ConfirmOldPasswordDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from './dto/update.user.dto';
import {
  GetUserAllInfoDto,
  GetUserAllInfoWithPasswordDto,
  GetUserDto,
  GetUserListItem,
} from './dto/get.user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';
import { InternshipsStage } from './enum/InternshipEnum';
import { CompetencyService } from 'src/competency/competency.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly competencyService: CompetencyService,
  ) {}

  private defaulfFields = {
    id: true,
    firstName: true,
    password: false,
    lastName: true,
    middleName: true,
    direction: true,
    role: true,
    login: true,
    email: true,
    phone: true,
    telegram: true,
    rate: true,
    status: true,
    study_group: true,
    plans: true,
    about: true,
    portfolio: true,
    note: true,
    inn: true,
    snils: true,
    birthday: true,
    passport_data: true,
    competencies: true,
    registration_address: true,
    living_address: true,
    requisites: true,
    npd_reference: true,
  };

  private createSelectedFieldsForUser(status: UserStatus): object {
    if (status === 'SPECIALIST') {
      return {
        ...this.defaulfFields,
        projects: true,
        tasks: true,
        competencies: true,
      };
    } else {
      const isPractice = status === 'INTERNSHIP' ? false : true;
      return {
        id: true,
        firstName: true,
        password: false,
        lastName: true,
        middleName: true,
        direction: true,
        role: true,
        email: true,
        phone: true,
        login: true,
        telegram: true,
        status: true,
        study_group: true,
        plans: true,
        about: true,
        portfolio: true,
        note: true,
        competencies: true,
        internships: {
          where: {
            isPractice,
          },
          select: {
            id: true,
            status: true,
            start_date: true,
            end_date: true,
          },
        },
      };
    }
  }

  private createSearchObject(search: string): object {
    return {
      OR: [
        {
          firstName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          middleName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          direction: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          login: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          telegram: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          study_group: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          plans: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          about: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          portfolio: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          note: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          inn: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          snils: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          birthday: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          passport_data: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          registration_address: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          living_address: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          requisites: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          npd_reference: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  private createStageObject(
    stage: InternshipsStage,
    status: UserStatus,
  ): object {
    if (stage === 'ALL') {
      return {};
    } else if (stage === 'ACTIVE') {
      const isPractice = status === 'PRACTICE' ? true : false;
      return {
        internships: {
          some: {
            isPractice,
            end_date: {
              gte: new Date(),
            },
          },
        },
      };
    } else if (stage === 'FINISHED') {
      const isPractice = status === 'PRACTICE' ? true : false;
      return {
        internships: {
          some: {
            isPractice,
            end_date: {
              lt: new Date(),
            },
          },
        },
      };
    }
  }

  private createUsersOrder(selectedDesc: string[]): object[] {
    const params = {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      direction: true,
      role: true,
      login: true,
      email: true,
      phone: true,
      telegram: true,
      status: true,
      study_group: true,
      plans: true,
      about: true,
      portfolio: true,
      competencies: true,
      note: true,
      inn: true,
      snils: true,
      birthday: true,
      passport_data: true,
      registration_address: true,
      living_address: true,
      requisites: true,
      npd_reference: true,
    };
    const orderParams = [];
    selectedDesc.forEach((desc) => {
      params[desc]
        ? desc === 'competencies'
          ? orderParams.push({
              [desc]: {
                _count: 'desc',
              },
            })
          : orderParams.push({ [desc]: 'desc' })
        : null;
    });
    return orderParams;
  }

  async getUsersByFields(
    selectedFields: string[],
    descParams: object[],
    whereObject: object,
    status: UserStatus | null,
    competenciesArray: string[],
  ): Promise<Partial<GetUserDto>[]> {
    const specialstFieldsObj = {
      id: false,
      firstName: false,
      password: false,
      lastName: false,
      middleName: false,
      direction: false,
      role: false,
      email: false,
      login: false,
      phone: false,
      telegram: false,
      status: false,
      study_group: false,
      plans: false,
      about: false,
      portfolio: false,
      note: false,
      inn: false,
      snils: false,
      birthday: false,
      passport_data: false,
      registration_address: false,
      living_address: false,
      requisites: false,
      npd_reference: false,
      competencies: false,
    };

    const internsFieldsObj = {
      id: false,
      firstName: false,
      password: false,
      lastName: false,
      middleName: false,
      direction: false,
      role: false,
      email: false,
      phone: false,
      telegram: false,
      status: false,
      study_group: false,
      plans: false,
      about: false,
      portfolio: false,
      note: false,
      competencies: false,
      internships: {
        where: {
          isPractice: false,
        },
        select: {
          id: true,
          status: false,
          end_date: false,
          start_date: false,
        },
      },
    };

    if (status === 'SPECIALIST') {
      selectedFields.forEach((field) => {
        specialstFieldsObj[field] === false
          ? (specialstFieldsObj[field] = true)
          : null;
      });
    } else if (status === 'INTERNSHIP' || status === 'PRACTICE') {
      const isPractice = status === 'PRACTICE' ? true : false;
      internsFieldsObj.internships.where.isPractice = isPractice;
      selectedFields.forEach((field) => {
        internsFieldsObj[field] === false
          ? (internsFieldsObj[field] = true)
          : null;
        if (
          field === 'start_date' ||
          field === 'end_date' ||
          field === 'status'
        ) {
          internsFieldsObj.internships.select[field] = true;
        }
      });
    }
    const fieldsObj =
      status === 'SPECIALIST' ? specialstFieldsObj : internsFieldsObj;
    if (competenciesArray.length && fieldsObj.competencies) {
      whereObject['competencies'] = {
        some: {
          text: {
            in: competenciesArray,
          },
        },
      };
    }
    if (Object.keys(whereObject).length) {
      return await this.prisma.user.findMany({
        where: whereObject,
        select: fieldsObj,
        orderBy: descParams.length ? descParams : { id: 'asc' },
      });
    } else {
      return await this.prisma.user.findMany({
        select: fieldsObj,
        orderBy: descParams.length ? descParams : { id: 'asc' },
      });
    }
  }
  async getAllUsers(
    selectedFields: string[],
    descParams: object[],
    search: string,
    competenciesArray: string[],
  ): Promise<Partial<GetUserDto>[]> {
    const searchObject = this.createSearchObject(search);
    try {
      if (selectedFields.length) {
        return this.getUsersByFields(
          selectedFields,
          descParams,
          {
            status: {
              equals: 'SPECIALIST',
            },
            role: {
              equals: 'SPECIALIST',
            },
            ...searchObject,
          },
          'SPECIALIST',
          competenciesArray,
        );
      } else {
        return await this.prisma.user.findMany({
          where: {
            role: {
              equals: 'SPECIALIST',
            },
            status: {
              equals: 'SPECIALIST',
            },
            ...searchObject,
          },
          select: {
            ...this.defaulfFields,
          },
          orderBy: descParams.length ? descParams : { id: 'asc' },
        });
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getInternsOrPracticantsWithoutSelectedFields(
    stage: InternshipsStage,
    status: UserStatus,
    search: string,
    competenciesArray: string[],
  ): Promise<Partial<GetUserDto>[]> {
    const searchParam = search.length ? search.trim() : '';
    const searchObject =
      searchParam.length > 0 ? this.createSearchObject(search) : {};
    const stageObject = this.createStageObject(stage, status);
    const selectedObject = this.createSelectedFieldsForUser(status);
    const whereObject = {
      role: {
        equals: UserStatus.SPECIALIST,
      },
      status: {
        equals: status,
      },
      ...stageObject,
      ...searchObject,
    };
    if (competenciesArray.length) {
      whereObject['cometencies'] = {
        some: {
          text: {
            in: competenciesArray,
          },
        },
      };
    }
    return await this.prisma.user.findMany({
      where: whereObject,
      select: {
        ...selectedObject,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async getInternsOrPracticantsBySelectedFields(
    stage: InternshipsStage,
    status: UserStatus,
    selectedFields: string[],
    descParams: object[],
    search: string,
    competenciesArray: string[],
  ): Promise<Partial<GetUserDto>[]> {
    const searchParam = search.length > 0 ? search.trim() : '';
    const searchObject = searchParam.length
      ? this.createSearchObject(search)
      : {};
    const stageObject = this.createStageObject(stage, status);
    const whereObject = {
      role: {
        equals: 'SPECIALIST',
      },
      status: {
        equals: status,
      },
      ...stageObject,
      ...searchObject,
    };
    return this.getUsersByFields(
      selectedFields,
      descParams,
      whereObject,
      status,
      competenciesArray,
    );
  }
  async getInternsOrPracticants(
    selectedFields: string[],
    descParams: object[],
    status: UserStatus,
    stage: InternshipsStage,
    search: string,
    competenciesArray: string[],
  ): Promise<Partial<GetUserDto>[]> {
    if (selectedFields.length) {
      return this.getInternsOrPracticantsBySelectedFields(
        stage,
        status,
        selectedFields,
        descParams,
        search,
        competenciesArray,
      );
    } else {
      return this.getInternsOrPracticantsWithoutSelectedFields(
        stage,
        status,
        search,
        competenciesArray,
      );
    }
  }

  async getUsersByStatus(
    status: UserStatus,
    fields: string,
    desc: string,
    stage: InternshipsStage,
    search: string,
    competencies: string,
  ): Promise<Partial<GetUserDto>[]> {
    const searchString = search ? search.trim() : '';
    const selectedDesc = desc ? desc.split(',') : [];
    const selectedFields = fields ? fields.split(',') : [];
    const competenciesArray = competencies ? competencies.split(',') : [];
    const descParams = this.createUsersOrder(selectedDesc);
    if (status === 'INTERNSHIP' || status === 'PRACTICE') {
      return this.getInternsOrPracticants(
        selectedFields,
        descParams,
        status,
        stage,
        searchString,
        competenciesArray,
      );
    } else {
      return this.getAllUsers(
        selectedFields,
        descParams,
        searchString,
        competenciesArray,
      );
    }
  }

  async getUsersList(search: string): Promise<GetUserListItem[]> {
    const searchValue = search ? search.trim() : '';
    try {
      return await this.prisma.user.findMany({
        where: {
          OR: [
            {
              firstName: {
                contains: searchValue,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: searchValue,
                mode: 'insensitive',
              },
            },
            {
              middleName: {
                contains: searchValue,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          role: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getUserByRole(
    role: Role,
    fields: string,
    desc: string,
  ): Promise<Partial<GetUserDto>[]> {
    const selectedFields = fields ? fields.split(',') : [];
    const selectedDesc = desc ? desc.split(',') : [];
    const descParams = this.createUsersOrder(selectedDesc);
    try {
      if (selectedFields.length) {
        return this.getUsersByFields(selectedFields, descParams, {}, null, []);
      } else {
        return await this.prisma.user.findMany({
          where: {
            role,
          },
        });
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findUser(
    login: string,
  ): Promise<Partial<GetUserAllInfoWithPasswordDto>> {
    try {
      return await this.prisma.user.findUnique({
        where: {
          login,
        },
        /*include: {
          organization: {
            select: {
              id: true,
            },
          },
        },*/
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProfileInfoById(
    id: number,
    status: UserStatus,
    role: Role,
  ): Promise<Partial<GetUserAllInfoDto>> {
    if (role === 'CUSTOMER') {
      try {
        return await this.prisma.user.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            email: true,
            role: true,
            login: true,
            firstName: true,
            lastName: true,
            middleName: true,
/*
            organization: {
              select: {
                id: true,
                title: true,
                legal_address: true,
                actual_address: true,
                inn: true,
                kpp: true,
                ogrn: true,
                okpo: true,
                bank_requisites: true,
                executive_office: true,
                contact_data: true,
                contact_person: {
                  select: {
                    firstName: true,
                    lastName: true,
                    middleName: true,
                  },
                },
                projects: true,
              },
            },
*/
          },
        });
      } catch (error) {
        throw new BadRequestException(error);
      }
    } else if (role === 'SPECIALIST') {
      const selctedFeilds = this.createSelectedFieldsForUser(status);
      try {
        return await this.prisma.user.findUnique({
          where: {
            id,
          },
          select: selctedFeilds,
        });
      } catch (error) {
        throw new BadRequestException(error);
      }
    } else if (role === 'ADMIN') {
      try {
        return await this.prisma.user.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            login: true,
            middleName: true,
            phone: true,
            direction: true,
            competencies: true,
            position: true,
          },
        });
      } catch (error) {
        throw new BadRequestException(error);
      }
    }
  }

  async createUser(userDto: CreateUserDto): Promise<GetUserDto> {
    try {
      const exitsUser = await this.prisma.user.findUnique({
        where: {
          login: userDto.login,
        },
      });
      if (exitsUser) {
        throw new BadRequestException('USER ALREADY EXISTS');
      }
      function generatePassword() {
        const length = 8;
        const charset =
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; ++i) {
          result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
      }
      const randomPassword = generatePassword();
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash(randomPassword, salt);
      const createdUser = await this.prisma.user.create({
        data: {
          ...userDto,
          password,
          email: userDto.login,
          role: 'GUEST',
        },
      });
      await this.mailerService.sendMail({
        from: process.env.MAIL,
        to: createdUser.login,
        subject: 'Данные для входа на платформу',
        template: join(__dirname, '/../templates', 'loginData'),
        context: {
          name: createdUser.firstName,
          login: createdUser.login,
          password: randomPassword,
          link: process.env.PLATFORM_URL,
        },
      });
      return createdUser;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getUserById(id: number): Promise<Partial<GetUserAllInfoDto>> {
    try {
      return await this.prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          competencies: true,
         // internships: true,
          projects: true,
          tasks: true,
          review_tasks: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<GetUserDto> {
    const { competencies, ...updateUserInfo } = updateUserDto;
    const competenciesArray = competencies
      ? competencies.length
        ? competencies.split(', ')
        : []
      : [];
    try {
      if (competenciesArray.length) {
        await this.competencyService.updateCompetencyForUser(
          competenciesArray,
          id,
        );
      }
      return await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          ...updateUserInfo,
        },
        include: {
          competencies: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async confirmUserOldPassword(
    id: number,
    confirmOldPasswordDto: ConfirmOldPasswordDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    const isMatch = await bcrypt.compare(
      confirmOldPasswordDto.oldPassword,
      user.password,
    );

    if (isMatch) {
      return true;
    }
  }

  async updateUserPassword(
    id: number,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<boolean> {
    try {
      if (
        updateUserPasswordDto.newPassword ===
        updateUserPasswordDto.newPasswordConfirm
      ) {
        const salt = await bcrypt.genSalt();
        const password = await bcrypt.hash(
          updateUserPasswordDto.newPassword,
          salt,
        );
        await this.prisma.user.update({
          where: { id },
          data: {
            password,
          },
        });
        return true;
      }
      throw new BadRequestException('ERROR PASSWORD CONFIRMATION');
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /*async deleteUserById(id: number): Promise<Boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: {
            id,
          },
          include: {
            internships: true,
          },
        });
        await tx.internship.deleteMany({
          where: {
            user_id: user.id,
          },
        });
        await tx.user.delete({
          where: {
            id: user.id,
          },
        });
      });
      return true;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }*/
}
