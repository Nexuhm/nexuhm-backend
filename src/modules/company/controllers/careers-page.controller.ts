import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from '../schemas/company.schema';
import { Model } from 'mongoose';
import { CareersPage } from '../schemas/careers-page.schema';

@Controller('/company')
export class CareersPageController {
  constructor(
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
    @InjectModel(CareersPage.name)
    private readonly careersPageModel: Model<CareersPage>,
  ) {}

  @Get('/:slug')
  async getCareersPage(@Param('slug') slug) {
    const company = await this.companyModel.findOne({ slug });
    const careersPage = await this.careersPageModel.findOne({ company });

    if (!careersPage) {
      throw new NotFoundException();
    }

    return careersPage;
  }
}
