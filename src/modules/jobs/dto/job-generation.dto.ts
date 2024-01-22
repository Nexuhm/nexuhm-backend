import { ApiProperty } from '@nestjs/swagger';

export class JobGenerationDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;
}
