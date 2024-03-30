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

  /**
   * Updates the company details for a user.
   *
   * @param {number} stage - The stage of onboarding.
   * @param {CompanyDetailsDto} fields - The updated company details.
   * @param {UserDocument} user - The user document.
   * @returns {Promise<void>} A Promise representing the result of the update operation.
   */
  @Post('/details')
  @UseGuards(JwtAuthGuard)
  async setCompanyDetails(
    @Body() fields: CompanyDetailsDto,
    @User() user: UserDocument,
  ) {
    const company = await this.companyModel.findById(user.company);

    if (!company) {
      throw new BadRequestException();
    }

    if (fields.slug) {
      const exists = await this.companyModel.findOne({
        _id: { $ne: company._id },
        slug: fields.slug,
      });

      if (exists) {
        throw new BadRequestException({
          fields: {
            slug: 'Company with following namespace exists already',
          },
        });
      }
    }

    await company.updateOne(fields);
  }
}
