import {
  BadRequestException,
  Body,
  Controller,
  Post,
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
import slugify from 'slugify';

@Controller('/company/onboarding')
export class OnboardingController {
  constructor(
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
  ) {}

  /**
   * Updates the company details for a user.
   *
   * @param {number} stage - The stage of onboarding.
   * @param {CompanyDetailsDto} fields - The updated company details.
   * @param {UserDocument} user - The user document.
   * @returns {Promise<void>} A Promise representing the result of the update operation.
   */
  @Post('/details')
  @ApiBody({ type: CompanyDetailsDto })
  @UseGuards(JwtAuthGuard)
  async setCompanyDetails(
    @Body() fields: CompanyDetailsDto,
    @User() user: UserDocument,
  ) {
    const company = await this.companyModel.findById(user.company);

    if (!company) {
      throw new BadRequestException();
    }

    // automatically set slug only when there is no current value
    if (fields.name && !company.slug) {
      // generate slug from the name
      const slug = await slugify(fields.name, {
        lower: true,
        strict: true,
        trim: true,
      });

      fields.slug = slug;
    }

    await company.updateOne(fields);
  }
}
