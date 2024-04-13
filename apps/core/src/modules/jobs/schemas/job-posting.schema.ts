import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { JobPostingState } from '../types/job-posting-state.enum';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import { CompanyDocument } from '@/core/modules/company/schemas/company.schema';
import {
  ScreeningQuestion,
  ScreeningQuestionSchema,
} from './screening-question.schema';
import { JobSalary, JobSalarySchema } from './job-salary.schema';

export type JobPostingDocument = HydratedDocument<JobPosting>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  toObject: {
    virtuals: true,
    getters: true,
  },
})
export class JobPosting {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  slug: string;

  @Prop()
  description: string;

  @Prop()
  code: string;

  @Prop()
  employmentType: string;

  @Prop()
  location: string;

  @Prop()
  content: string;

  @Prop({ type: JobSalarySchema })
  salary: JobSalary;

  @Prop({ type: [ScreeningQuestionSchema] })
  screeningQuestions: mongoose.Types.DocumentArray<ScreeningQuestion>;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  author: UserDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  })
  company: CompanyDocument;

  @Prop({
    type: String,
    enum: [
      JobPostingState.Draft,
      JobPostingState.Filled,
      JobPostingState.Published,
    ],
  })
  state: JobPostingState;

  @Prop({
    type: Date,
  })
  publishedAt: Date;
}

export const JobPostingSchema = SchemaFactory.createForClass(JobPosting);

JobPostingSchema.virtual('totalCandidates', {
  ref: 'Candidate',
  localField: '_id',
  foreignField: 'job',
  count: true,
});
