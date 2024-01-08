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

  picture: string;

  accessToken: string;

  refreshToken: string;
}
