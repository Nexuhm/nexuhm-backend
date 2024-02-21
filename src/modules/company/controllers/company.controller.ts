import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
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

@UseGuards(JwtAuthGuard)
@Controller('/admin/company')
export class CompanyController {
  constructor(
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
  ) {}

  @Get()
  async getCompanyDetails(@User() user: UserDocument) {
    const company = await this.companyModel.findById(user.company);

    if (!company) {
      throw new NotFoundException();
    }

    return company;
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
