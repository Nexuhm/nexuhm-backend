import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from '../schemas/company.schema';
import mongoose, { AnyKeys, Model } from 'mongoose';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<Company>,
  ) {}

  create(fields: AnyKeys<Company>) {
    return this.companyModel.create(fields);
  }

  findById(id) {
    return this.companyModel.findById(id);
  }
}
