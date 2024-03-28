import { UserIntegration } from '@/core/modules/users/schemas/user-integration.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class SignUpDto {
  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  picture?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  inviteToken: string;

  integration: Omit<UserIntegration, '_id'>;
}
