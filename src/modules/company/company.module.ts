import { Module } from '@nestjs/common';
import { Company, CompanySchema } from './schemas/company.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyService } from './services/company.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Company.name,
        useFactory: () => CompanySchema,
      },
    ]),
  ],
  exports: [CompanyService],
  providers: [CompanyService],
  controllers: [],
})
export class CompanyModule {}
