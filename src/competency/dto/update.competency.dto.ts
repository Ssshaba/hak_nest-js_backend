import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCompetencyDto {
  @ApiProperty({ name: 'text' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
    text: string;

  @ApiProperty({ name: 'users', default: [] })
  @IsOptional()
    users: number[];
}
