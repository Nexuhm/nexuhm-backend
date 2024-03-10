import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty()
  firsname?: string;

  @ApiProperty()
  lastname?: string;

  @ApiProperty()
  picture?: string;
}
