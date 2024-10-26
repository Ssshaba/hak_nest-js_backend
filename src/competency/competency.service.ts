import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma/prisma.service';
import { CreateCompetencyDto } from './dto/create.competency.dto';
import { UpdateCompetencyDto } from './dto/update.competency.dto';
import {
  GetCompetencyFullInfoDto,
  GetCompetencyShortDto,
  GetCompetencyTitleDto,
} from './dto/get.competency.dto';

@Injectable()
export class CompetencyService {
  constructor(private prisma: PrismaService) {}
  async getAllCompetencies(): Promise<GetCompetencyShortDto[]> {
    try {
      return await this.prisma.competency.findMany();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getAllCompetenciesTitles(): Promise<GetCompetencyTitleDto[]> {
    try {
      return await this.prisma.competency.findMany({
        select: {
          id: true,
          text: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getCompetencyById(id: number): Promise<GetCompetencyFullInfoDto> {
    try {
      return await this.prisma.competency.findUnique({
        where: {
          id,
        },
        include: {
          users: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async createCompetency(
    createCompetencyDto: CreateCompetencyDto,
  ): Promise<GetCompetencyShortDto> {
    const usersToConnect = createCompetencyDto.users?.map((user) => {
      return {
        id: user,
      };
    });

    try {
      return this.prisma.competency.create({
        data: {
          text: createCompetencyDto.text,
          users: {
            connect: usersToConnect,
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateCompetencyForUser(competenciesArray: string[], id: number) {
    const usersComeptencies = await this.prisma.competency.findMany({
      where: {
        users: {
          some: {
            id,
          },
        },
      },
    });
    const disconnectPromises = usersComeptencies.map(async (competency) => {
      if (!competenciesArray.includes(competency.text)) {
        await this.prisma.competency.update({
          where: {
            id: competency.id,
          },
          data: {
            users: {
              disconnect: {
                id: id,
              },
            },
          },
        });
      }
    });

    const connectPromises = competenciesArray.map(async (competency) => {
      const competencyModel = await this.prisma.competency.findUnique({
        where: {
          text: competency,
        },
      });
      if (competencyModel) {
        await this.prisma.competency.update({
          where: {
            text: competency,
          },
          data: {
            users: {
              connect: {
                id: id,
              },
            },
          },
        });
      } else {
        await this.prisma.competency.create({
          data: {
            text: competency,
            users: {
              connect: {
                id: id,
              },
            },
          },
        });
      }
    });

    await Promise.all([...disconnectPromises, ...connectPromises]);
    return true;
  }

  async udpateCompetency(
    id: number,
    udpateCompetencyDto: UpdateCompetencyDto,
  ): Promise<GetCompetencyFullInfoDto> {
    const usersToConnect = udpateCompetencyDto.users?.map((user) => {
      return {
        id: user,
      };
    });

    try {
      return await this.prisma.competency.update({
        where: {
          id,
        },
        data: {
          text: udpateCompetencyDto.text,
          users: {
            connect: usersToConnect,
          },
        },
        include: {
          users: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteCompetency(id: number): Promise<Boolean> {
    try {
      await this.prisma.competency.delete({
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
