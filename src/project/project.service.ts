import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma/prisma.service';
import { CreateProjectDto } from './dto/create.project.dto';
import { UpdateProjectDto } from './dto/update.project.dto';
import {
  GetProjectAllInfoDto,
  GetProjectListItem,
  GetProjectShortDto,
} from './dto/get.project.dto';
import { ProjectStage } from './enum/stage';
import { Role } from '@prisma/client';
@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  private createStageObject(stage: ProjectStage): object {
    if (stage === 'ACTIVE') {
      return {
        end_date: {
          gte: new Date(),
        },
      };
    } else if (stage === 'ALL') {
      return {};
    } else if (stage === 'POTENCIAL') {
      return {
        start_date: null,
      };
    } else if (stage === 'FINISHED') {
      return {
        end_date: {
          lt: new Date(),
        },
      };
    }
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
          customer: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          contact_person: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          contact_data: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          technical_task: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          users: {
            some: {
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
              ],
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

  private createProjectsOrder(selectedDesc: string[]): object[] {
    const descs = {
      id: true,
      title: true,
      customer: true,
      status: true,
      contact_person: true,
      contact_data: true,
      description: true,
      technical_task: true,
      comment: true,
      users: true,
    };
    const descsParams = [];

    selectedDesc.forEach((desc) => {
      desc === 'users'
        ? descsParams.push({ [desc]: { _count: 'desc' } })
        : descs[desc]
          ? descsParams.push({ [desc]: 'desc' })
          : null;
    });

    return descsParams;
  }

  async getProjectByFields(
    selectedFields: string[],
    descs: object[],
    searchObject: object,
    stageObject: object,
    id: number,
    role: Role,
  ): Promise<Partial<GetProjectShortDto>[]> {
    const fields = {
      id: false,
      title: false,
      customer: false,
      status: true,
      contact_person: false,
      contact_data: false,
      description: false,
      technical_task: false,
      comment: false,
      users: false,
    };
    selectedFields.forEach((field) => {
      fields[field] === false ? (fields[field] = true) : null;
    });
    let projectFindObject = {
      where: {
        ...stageObject,
        ...searchObject,
      },
      select: {
        ...fields,
      },
      orderBy: descs.length ? descs : [{ id: 'asc' }],
    };
    if (role === 'CUSTOMER') {
      projectFindObject.where['organization'] = {
        contact_person_id: id,
      };
    } else if (role === 'SPECIALIST') {
      projectFindObject.where['users'] = {
        some: {
          id: id,
        },
      };
    }
    return await this.prisma.project.findMany(projectFindObject);
  }

  async getAllProjects(
    fields: string,
    desc: string,
    search: string,
    stage: ProjectStage,
    id: number,
    role: Role,
  ): Promise<Partial<GetProjectShortDto>[]> {
    const searchParam = search ? search.trim() : '';
    const searchObject =
      searchParam.length > 0 ? this.createSearchObject(searchParam) : {};
    const stageObject = this.createStageObject(stage);
    const selectedFields = fields ? fields.split(',') : [];
    const selectedDesc = desc ? desc.split(',') : [];
    const descs = this.createProjectsOrder(selectedDesc);
    try {
      if (selectedFields.length) {
        return this.getProjectByFields(
          selectedFields,
          descs,
          searchObject,
          stageObject,
          id,
          role,
        );
      } else {
        let projectFindObject = {
          where: {
            ...stageObject,
            ...searchObject,
          },
          include: {
            users: true,
          },
          orderBy: descs.length ? descs : [{ id: 'asc' }],
        };
        if (role === 'CUSTOMER') {
          projectFindObject.where['organization'] = {
            contact_person_id: id,
          };
        } else if (role === 'SPECIALIST') {
          projectFindObject.where['users'] = {
            some: {
              id: id,
            },
          };
        }
        return await this.prisma.project.findMany(projectFindObject);
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProjectsList(
    title: string,
    role: Role,
    id: number,
  ): Promise<GetProjectListItem[]> {
    try {
      const titleParam = title ? title.trim() : '';
      const whereObject = {};
      if (role === 'CUSTOMER') {
        whereObject['organization'] = {
          contact_person_id: id,
        };
      } else if (role === 'SPECIALIST') {
        whereObject['users'] = {
          some: {
            id: id,
          },
        };
      }
      return await this.prisma.project.findMany({
        where: {
          title: {
            contains: titleParam,
            mode: 'insensitive',
          },
          ...whereObject,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProjectById(id: number): Promise<GetProjectAllInfoDto> {
    try {
      return await this.prisma.project.findUnique({
        where: {
          id,
        },
        include: {
          owner: true,
          tasks: true,
          users: true,
       /*   organization: {
            include: {
              contact_person: true,
            },
          },*/
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async createProject(
    createProjectDto: CreateProjectDto,
  ): Promise<GetProjectAllInfoDto> {
    const { users, tasks, ...projectData } = createProjectDto;

    const usersToConnect = users?.map((user) => {
      return {
        id: user,
      };
    });
    const tasksToConnect = tasks?.map((task) => {
      return {
        id: task,
      };
    });
    console.log(createProjectDto);
    try {
      return await this.prisma.project.create({
        data: {
          ...projectData,
          users: {
            connect: usersToConnect,
          },
          tasks: {
            connect: tasksToConnect,
          },
        },
        include: {
          users: true,
          tasks: true,
          owner: true,
         /* organization: {
            include: {
              contact_person: true,
            },
          },*/
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateProject(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<GetProjectAllInfoDto> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const project = await tx.project.findUnique({
          where: {
            id: id,
          },
          include: {
            users: true,
            tasks: true,
          },
        });
        const { users, tasks, ...updateProjectData } = updateProjectDto;
        const usersToConnect =
          users && users.length
            ? users
                ?.filter((user) => {
                  return project.users.find(
                    (projectUser) => projectUser.id === user,
                  )
                    ? false
                    : true;
                })
                .map((user) => {
                  return {
                    id: user,
                  };
                })
            : [];
        const usersToDisconnect =
          users && users.length
            ? project.users
                ?.filter((projectUser) => {
                  return users.find((user) => projectUser.id === user)
                    ? false
                    : true;
                })
                .map((user) => {
                  return {
                    id: user.id,
                  };
                })
            : [];
        const tasksToConnect =
          tasks && tasks.length && project.tasks.length
            ? tasks
                ?.filter((task) => {
                  return project.tasks.find(
                    (projectTask) => projectTask.id === task,
                  );
                })
                .map((task) => {
                  return {
                    id: task,
                  };
                })
            : [];

        await tx.project.update({
          where: {
            id,
          },
          data: {
            ...updateProjectData,
            users: {
              connect: usersToConnect,
              disconnect: usersToDisconnect,
            },
            tasks: {
              connect: tasksToConnect,
            },
          },
        });
      });
      return await this.prisma.project.findUnique({
        where: {
          id: id,
        },
        include: {
          owner: true,
          tasks: true,
          users: true,
          /*organization: {
            include: {
              contact_person: true,
            },
          },*/
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteProject(id: number): Promise<Boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.task.deleteMany({
          where: {
            project_id: id,
          },
        });
        await tx.project.delete({
          where: {
            id: id,
          },
        });
      });
      return true;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
