import { ApiProperty } from '@nestjs/swagger';

export class LocalLoginDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
