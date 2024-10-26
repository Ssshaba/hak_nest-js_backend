import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma/prisma.service';
import { CreateTaskDto } from './dto/create.task.dto';
import { UpdateTaskDto } from './dto/update.task.dto';
import { GetTaskAllInfoDto, GetTaskShortDto } from './dto/get.task.dto';
import { Role } from '@prisma/client';
import {MailerService} from "@nestjs-modules/mailer";
import {join} from "path";
import { Workbook } from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import {uploadFileToBucket} from "../utils/aws";

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService,
  private readonly mailerService: MailerService
) {}

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
      onlyMyTasks: boolean,
  ): Promise<Partial<GetTaskShortDto>[]> {
    const searchParam = search ? search.trim() : '';
    const searchObject =
        searchParam.length > 0 ? this.createSearchObject(searchParam) : {};
    const selectedFields = fields ? fields.split(',') : [];
    const selectedDesc = desc ? desc.split(',') : [];
    const orderParams = this.createTasksOrder(selectedDesc);
    const whereObject: any = {};

    try {
      if (onlyMyTasks) {
        // Фильтрация только по задачам текущего пользователя
        whereObject['OR'] = [
          {
            executor_id: id,
          },
          {
            reviewer_id: id,
          },
        ];
      }
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
      const task = await this.prisma.task.create({
        data: {
          ...createTaskDto,
        },
        include: {
          executor: true,
          reviewer: true,
          project: true,
        },
      });

      if (task.executor?.email) {
        await this.mailerService.sendMail({
          from: process.env.MAIL,
          to: task.executor.email,
          subject: 'Уведомление о новой задаче',
          template: join(__dirname, '../templates', 'newTaskNotification'),
          context: {
            name: task.executor.firstName,
            taskTitle: task.title,
           // taskDescription: task.description ?? '',
            startDate: task.start_date?.toISOString() ?? '',
            endDate: task.end_date?.toISOString() ?? '',
          },
        });
      }


      if (task.reviewer?.email) {
        await this.mailerService.sendMail({
          from: process.env.MAIL,
          to: task.reviewer.email,
          subject: 'Уведомление о новой задаче',
          template: join(__dirname, '../templates', 'newTaskNotification'),
          context: {
            name: task.reviewer.firstName,
            taskTitle: task.title,
           // taskDescription: task.description ?? '',
            startDate: task.start_date?.toISOString() ?? '',
            endDate: task.end_date?.toISOString() ?? '',
          },
        });
      }

      return task;
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


  async exportTasksToExcel(projectId: number): Promise<string> {
    // Получаем данные задач для проекта
    const tasks = await this.getAllTasksForProject(null, null, null, null, null, projectId, null);

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Tasks');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Название', key: 'title', width: 30 },
      { header: 'Описание', key: 'description', width: 40 },
      { header: 'Дата начала', key: 'start_date', width: 15 },
      { header: 'Дата окончания', key: 'end_date', width: 15 },
      { header: 'Статус', key: 'status', width: 15 },
      { header: 'Часы', key: 'hours', width: 10 },
      { header: 'Проект', key: 'project_title', width: 20 },
    ];

    tasks.forEach(task => {
      worksheet.addRow({
        id: task.id,
        title: task.title,
        description: task.description,
        start_date: task.start_date ? new Date(task.start_date).toLocaleString() : '',
        end_date: task.end_date ? new Date(task.end_date).toLocaleString() : '',
        status: task.status,
        hours: task.hours,
        project_title: task.project?.title ?? '',
      });
    });

    const filePath = path.resolve(__dirname, `../../exports/tasks_project_${projectId}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    // Загрузка файла в бакет
    const bucketName = process.env.BUCKET;
    const key = `tasks_project_${projectId}_${Date.now()}.xlsx`; // Уникальный ключ

    await uploadFileToBucket(filePath, bucketName, key);

    // Возвращаем URL для доступа к файлу
    return `https://${bucketName}.storage.yandexcloud.net/${key}`;
  }
}
