import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from '../schemas/company.schema';
import { Model } from 'mongoose';
import { JobPosting } from '@/modules/jobs/schemas/job-posting.schema';
import { JobPostingState } from '@/modules/jobs/types/job-posting-state.enum';

@Controller('/company')
export class CompanyController {
  constructor(
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
    @InjectModel(JobPosting.name)
    private readonly jobPostingModel: Model<JobPosting>,
  ) {}

  @Get('/:slug')
  async getCareersPage(@Param('slug') slug) {
    const company = await this.companyModel
      .findOne({ slug })
      .populate('careersPage');

    if (!company) {
      throw new NotFoundException();
    }

    return company;
  }

  @Get('/:slug/openings')
  async getOpenPosition(@Param('slug') slug) {
    const company = await this.companyModel.findOne({ slug });
    const jobs = await this.jobPostingModel.find({
      company,
      state: JobPostingState.Published,
    });

    return jobs;
  }
}
