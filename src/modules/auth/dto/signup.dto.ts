import { UserIntegration } from '@/modules/users/schemas/user-integration.schema';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password?: string;

  picture?: string;

  integration: Omit<UserIntegration, '_id'>;
}
