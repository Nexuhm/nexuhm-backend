import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidateNoteDto {
  @ApiProperty()
  note: string;
}
