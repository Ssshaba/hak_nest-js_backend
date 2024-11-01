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
import {uploadFileToBucket} from 'src/utils/aws';
import {PutObjectCommand} from "@aws-sdk/client-s3";
import { Buffer } from 'node:buffer';
import { PassThrough } from 'stream';

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
    const searchObject = searchParam.length > 0 ? this.createSearchObject(searchParam) : {};
    const selectedFields = fields ? fields.split(',') : [];
    const selectedDesc = desc ? desc.split(',') : [];
    const orderParams = this.createTasksOrder(selectedDesc);
    const whereObject: any = {};

    try {
      if (onlyMyTasks) {
        // Фильтрация только по задачам текущего пользователя
        whereObject['OR'] = [
          { executor_id: id },
          { reviewer_id: id },
        ];
      }
      if (role === 'SPECIALIST') {
        whereObject['OR'] = [
          { executor_id: id },
          { reviewer_id: id },
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
            executor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
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
    try {
      console.log('Получаем данные задач для проекта');
      console.log(`projectId: ${projectId}`);

      // Получаем задачи из базы данных
      const tasks = await this.prisma.task.findMany({
        where: { project_id: Number(projectId) }
      });

      console.log(`Полученные задачи: ${JSON.stringify(tasks)}`); // Логируем задачи для проверки
      console.log('Получили данные');

      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Tasks');
      console.log('шаг1');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Название', key: 'title', width: 30 },
        { header: 'Описание', key: 'description', width: 40 },
        { header: 'Дата начала', key: 'start_date', width: 15 },
        { header: 'Дата окончания', key: 'end_date', width: 15 },
        { header: 'Статус', key: 'status', width: 15 },
        { header: 'Часы', key: 'hours', width: 10 },
      ];
      console.log('шаг2');

      // Добавляем строки с данными задач
      tasks.forEach(task => {
        worksheet.addRow({
          id: task.id,
          title: task.title,
          description: task.description,
          start_date: task.start_date ? new Date(task.start_date).toLocaleString() : '',
          end_date: task.end_date ? new Date(task.end_date).toLocaleString() : '',
          status: task.status,
          hours: task.hours,
        });
      });
      console.log('шаг3');

      // Путь для сохранения файла на сервере
      const filePath = path.resolve(__dirname, `../../exports/tasks_project_${projectId}.xlsx`);
      console.log(`Сохраняем файл Excel на диск: ${filePath}`);
      console.log('шаг4');

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      await workbook.xlsx.writeFile(filePath);
      console.log('Файл Excel успешно сохранен на сервере');

      const baseUrl = 'https://persiky.ru';
     // return filePath;
      return `${baseUrl}${filePath}`;
    } catch (error) {
      console.error('Ошибка при получении задач:', error);
      throw new Error('Не удалось получить данные задач');
    }
  }
}
