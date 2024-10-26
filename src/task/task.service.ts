import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma/prisma.service';
import { CreateTaskDto } from './dto/create.task.dto';
import { UpdateTaskDto } from './dto/update.task.dto';
import { GetTaskAllInfoDto, GetTaskShortDto } from './dto/get.task.dto';
import { Role } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  private createTasksOrder(desc: string[]): object[] {
    const params = {
      id: true,
      title: true,
      description: true,
      start_date: true,
      end_date: true,
      is_done: true,
      project_id: true,
      comment: true,
      reviewer_id: true,
      executor_id: true,
      status: true,
      hours: true,
      project: true,
    };

    const orderParams = [];

    desc.forEach((descItem) => {
      descItem === 'project'
        ? orderParams.push({
            [descItem]: {
              title: 'desc',
            },
          })
        : params[descItem]
          ? orderParams.push({ [descItem]: 'desc' })
          : null;
    });
    return orderParams;
  }

  private createSearchObject(search: string): object {
    return {
      OR: [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          project: {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          comment: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  async getTasksByFields(
    selectedFields: string[],
    orderParams: object[],
    searchObject: object,
    whereObject: object,
  ): Promise<Partial<GetTaskShortDto>[]> {
    const fields = {
      id: false,
      title: false,
      description: false,
      start_date: false,
      end_date: false,
      is_done: false,
      project_id: false,
      comment: false,
      reviewer_id: false,
      executor_id: false,
      status: false,
      hours: false,
      project: {
        select: {
          title: false,
        },
      },
    };
    selectedFields.forEach((field) => {
      field === 'project'
        ? (fields[field].select.title = true)
        : fields[field] === false
          ? (fields[field] = true)
          : null;
    });
    fields.project.select.title === false ? delete fields.project : null;

    return await this.prisma.task.findMany({
      where: {
        AND: [
          {
            ...whereObject,
          },
          {
            ...searchObject,
          },
        ],
      },
      select: {
        ...fields,
      },
      orderBy: orderParams.length ? orderParams : { id: 'asc' },
    });
  }

  async getAllTasks(
    fields: string,
    desc: string,
    search: string,
    role: Role,
    id: number,
  ): Promise<Partial<GetTaskShortDto>[]> {
    const searchParam = search ? search.trim() : '';
    const searchObject = searchParam.length
      ? this.createSearchObject(searchParam)
      : {};
    const selectedFields = fields ? fields.split(',') : [];
    const selectedDesc = desc ? desc.split(',') : [];
    const orderParams = this.createTasksOrder(selectedDesc);
    const whereObject = {};
    try {
      if (role === 'SPECIALIST') {
        whereObject['OR'] = [
          {
            executor_id: id,
          },
          {
            reviewer_id: id,
          },
        ];
      } else if (role === 'CUSTOMER') {
        whereObject['project'] = {
          organization: {
            contact_person_id: id,
          },
        };
      }
      if (selectedFields.length) {
        return this.getTasksByFields(
          selectedFields,
          orderParams,
          searchObject,
          whereObject,
        );
      } else {
        return await this.prisma.task.findMany({
          where: {
            AND: [{ ...searchObject }, { ...whereObject }],
          },
          include: {
            project: {
              select: {
                title: true,
              },
            },
          },
          orderBy: orderParams.length ? orderParams : { id: 'asc' },
        });
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getAllTasksForProject(
    fields: string,
    desc: string,
    search: string,
    role: Role,
    id: number,
    projectId: number,
  ): Promise<Partial<GetTaskShortDto>[]> {
    const searchParam = search ? search.trim() : '';
    const searchObject =
      searchParam.length > 0 ? this.createSearchObject(searchParam) : {};
    const selectedFields = fields ? fields.split(',') : [];
    const selectedDesc = desc ? desc.split(',') : [];
    const orderParams = this.createTasksOrder(selectedDesc);
    const whereObject = {};
    try {
      if (role === 'SPECIALIST') {
        whereObject['OR'] = [
          {
            executor_id: id,
          },
          {
            reviewer_id: id,
          },
        ];
      } else if (role === 'CUSTOMER') {
        whereObject['project'] = {
          organization: {
            contact_person_id: id,
          },
        };
      }
      whereObject['project_id'] = projectId;
      if (selectedFields.length) {
        return this.getTasksByFields(
          selectedFields,
          orderParams,
          searchObject,
          whereObject,
        );
      } else {
        return await this.prisma.task.findMany({
          where: {
            AND: [{ ...whereObject }, { ...searchObject }],
          },
          include: {
            project: {
              select: {
                title: true,
              },
            },
          },
          orderBy: orderParams.length ? orderParams : { id: 'asc' },
        });
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getTaskById(id: number): Promise<GetTaskAllInfoDto> {
    try {
      return await this.prisma.task.findUnique({
        where: {
          id,
        },
        include: {
          executor: true,
          project: true,
          reviewer: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<GetTaskAllInfoDto> {
    try {
      return await this.prisma.task.create({
        data: {
          ...createTaskDto,
        },
        include: {
          executor: true,
          project: true,
          reviewer: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateTask(
    id: number,
    updateTaskDto: UpdateTaskDto,
  ): Promise<GetTaskAllInfoDto> {
    try {
      return await this.prisma.task.update({
        where: {
          id,
        },
        data: {
          ...updateTaskDto,
        },
        include: {
          executor: true,
          project: true,
          reviewer: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteTask(id: number): Promise<Boolean> {
    try {
      await this.prisma.task.delete({
        where: {
          id,
        },
      });
      return true;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}