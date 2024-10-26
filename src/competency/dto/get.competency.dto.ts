import { ApiProperty } from '@nestjs/swagger';
import { GetUserDto } from 'src/user/dto/get.user.dto';

export class GetCompetencyShortDto {
  @ApiProperty({ name: 'id', default: 'number' })
  id: number;

  @ApiProperty({ name: 'text', default: 'string' })
  text: string;
}

export class GetCompetencyFullInfoDto extends GetCompetencyShortDto {
  @ApiProperty({ name: 'users', default: [] })
  users: GetUserDto[];
}

export class GetCompetencyTitleDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ name: 'text', default: 'string' })
  text: string;
}
