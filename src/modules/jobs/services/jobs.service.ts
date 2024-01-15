import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JobPosting } from '../schemas/job-posting.schema';
import { AnyKeys, Model } from 'mongoose';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(JobPosting.name)
    private readonly jobPostingModel: Model<JobPosting>,
  ) {}

  create(fields: AnyKeys<JobPosting>) {
    return this.jobPostingModel.create(fields);
  }
}
