import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from '../schemas/company.schema';
import { Model } from 'mongoose';
import { JobPosting } from '@/core/modules/jobs/schemas/job-posting.schema';
import { JobPostingState } from '@/core/modules/jobs/types/job-posting-state.enum';
import { ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CompanyDetailsDto } from '../dto/company-details.dto';
import { UserDocument } from '../../users/schemas/user.schema';
import { User } from '@/core/lib/decorators/user.decorator';

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
  async getOpenPosition(
    @Param('slug') slug,
    @Query('limit', new DefaultValuePipe(0), new ParseIntPipe()) limit: number,
  ) {
    const company = await this.companyModel.findOne({ slug });
    const query = this.jobPostingModel.find({
      company,
      state: JobPostingState.Published,
    });

    if (limit) {
      query.limit(limit);
    }

    const jobs = await query.exec();

    return jobs;
  }
}
