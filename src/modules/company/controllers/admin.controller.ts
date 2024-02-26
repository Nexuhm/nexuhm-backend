import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CompanyDetailsDto } from '../dto/onboarding-details.dto';
import { ApiBody } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from '../schemas/company.schema';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard';
import { User } from '@/lib/decorators/user.decorator';
import { UserDocument } from '@/modules/users/schemas/user.schema';
import { CareersPage } from '../schemas/careers-page.schema';

@UseGuards(JwtAuthGuard)
@Controller('/admin/company')
export class CompanyAdminController {
  constructor(
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
    @InjectModel(CareersPage.name)
    private readonly careersPageModel: Model<CareersPage>,
  ) {}

  @Get()
  async getCompanyDetails(@User() user: UserDocument) {
    const company = await this.companyModel.findById(user.company);

    if (!company) {
      throw new NotFoundException();
    }

    return company;
  }

  @Get('/:companyId/careers-page')
  async getCareersPage(@Param('companyId') companyId) {
    return this.companyModel.findById(companyId).populate('careersPage');
  }

  @Put('/:companyId/careers-page')
  async updateCareersPage(
    @Param('companyId') companyId,
    @User() user: UserDocument,
    @Body() body,
  ) {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException();
    }

    const careersPage = await this.careersPageModel.findOneAndUpdate(
      { company },
      {
        ...body,
        company,
      },
      {
        upsert: true,
        new: true,
      },
    );

    if (user.company.equals(company!)) {
      throw new ForbiddenException();
    }

    return careersPage;
  }

  /**
   * Updates the company details for a user.
   *
   * @param {number} stage - The stage of onboarding.
   * @param {CompanyDetailsDto} fields - The updated company details.
   * @param {UserDocument} user - The user document.
   * @returns {Promise<void>} A Promise representing the result of the update operation.
   */
  @Put()
  @ApiBody({ type: CompanyDetailsDto })
  async setCompanyDetails(
    @Body() fields: CompanyDetailsDto,
    @User() user: UserDocument,
  ) {
    const company = await this.companyModel.findById(user.company);

    if (!company) {
      throw new BadRequestException();
    }

    company.set(fields);
    await company.save();
    return company;
  }
}
