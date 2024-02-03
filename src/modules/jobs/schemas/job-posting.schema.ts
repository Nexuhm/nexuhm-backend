import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { JobPostingState } from '../types/job-posting-state.enum';
import { UserDocument } from '@/modules/users/schemas/user.schema';
import { CompanyDocument } from '@/modules/company/schemas/company.schema';

export type JobPostingDocument = HydratedDocument<JobPosting>;

@Schema({ timestamps: true })
export class JobPosting {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  slug: string;

  @Prop()
  description: string;

  @Prop()
  employmentType: string;

  @Prop()
  location: string;

  @Prop()
  content: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  salary: any;

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
}

export const JobPostingSchema = SchemaFactory.createForClass(JobPosting);

JobPostingSchema.virtual('totalCandidates', {
  ref: 'Candidate',
  localField: '_id',
  foreignField: 'job',
  count: true,
});
