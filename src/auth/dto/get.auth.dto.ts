import { ApiProperty } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';

export class GetAuthDto {
  @ApiProperty({ name: 'access_token', default: 'string' })
  access_token: string;

  @ApiProperty({ name: 'id' })
  id: number;

  @ApiProperty({ name: 'email' })
  email: string;

  @ApiProperty({ name: 'firstName' })
  firstName: string;

  @ApiProperty({ name: 'middleName' })
  middleName: string;

  @ApiProperty({ name: 'lastName' })
  lastName: string;

  @ApiProperty({ name: 'role', enum: Role })
  role: Role;

  @ApiProperty({ name: 'status' })
  status: UserStatus;

  @ApiProperty({ name: 'organization_id' })
  organization_id: number | null;
}
