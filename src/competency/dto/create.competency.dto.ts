import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompetencyDto {
  @ApiProperty({ name: 'text' })
  @IsNotEmpty()
  @IsString()
    text: string;

  @ApiProperty({ name: 'users', default: [] })
  @IsNotEmpty()
  @IsOptional()
    users: number[];
}
