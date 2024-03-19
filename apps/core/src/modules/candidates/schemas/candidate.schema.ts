import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { JobPostingDocument } from '@/core/modules/jobs/schemas/job-posting.schema';
import { CandidateNote } from './candidate-note.schema';

export type CandidateDocument = HydratedDocument<Candidate>;

export interface CandidateExperience {
  title: string;
  organization: string;
  achievements?: string;
  start: string;
  end: string;
}

export enum RecruitmentStage {
  Applied = 'applied',
  Interview = 'interview',
  Awaiting = 'awaiting',
  Offer = 'offer',
  Hired = 'hired',
  Rejected = 'rejected',
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
})
export class Candidate {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  firstname: string;

  @Prop()
  lastname: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop({
    type: String,
    enum: [
      RecruitmentStage.Applied,
      RecruitmentStage.Awaiting,
      RecruitmentStage.Hired,
      RecruitmentStage.Interview,
      RecruitmentStage.Offer,
      RecruitmentStage.Rejected,
    ],
  })
  stage: RecruitmentStage;

  @Prop()
  location: string;

  @Prop()
  description: string;

  @Prop()
  score: number;

  @Prop()
  cultureScore: number;

  @Prop()
  cultureSummary: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  experience: mongoose.Types.DocumentArray<CandidateExperience>;

  @Prop()
  skillScore: number;

  @Prop()
  skillSummary: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'CandidateNote',
    default: [],
  })
  notes: mongoose.Types.DocumentArray<CandidateNote>;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  files: any;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
  })
  job: JobPostingDocument;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);

CandidateSchema.virtual('lastNote', {
  localField: '_id',
  foreignField: 'candidate',
  ref: 'CandidateNote',
  justOne: true,
});

CandidateSchema.index({ job: 1, email: 1 }, { unique: true });