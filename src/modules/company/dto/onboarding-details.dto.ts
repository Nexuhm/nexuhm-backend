import { ApiProperty } from '@nestjs/swagger';

export class CompanyDetailsDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  companySize: string;

  @ApiProperty()
  industry: string;

  @ApiProperty()
  website: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  cultureDescription: string;
}
