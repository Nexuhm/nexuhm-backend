import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { JobPostingDocument } from '@/modules/jobs/schemas/job-posting.schema';

export type CandidateDocument = HydratedDocument<Candidate>;

@Schema({ timestamps: true })
export class Candidate {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  firstname: string;

  @Prop()
  lastname: string;

  @Prop()
  email: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  files: any;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
  })
  job: JobPostingDocument;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
