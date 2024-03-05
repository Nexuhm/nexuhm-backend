import { ApiProperty } from '@nestjs/swagger';

export class JobApplicationDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  location: string;
}
