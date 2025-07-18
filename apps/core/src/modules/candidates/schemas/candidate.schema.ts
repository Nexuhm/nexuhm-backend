import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { JobPostingDocument } from '@/core/modules/jobs/schemas/job-posting.schema';
import { CandidateNote } from './candidate-note.schema';
import { CompanyDocument } from '@/core/modules/company/schemas/company.schema';
import {
  ScreeningQuestionAnswer,
  ScreeningQuestionAnswerSchema,
} from './screening-question-answer.schema';

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

export enum ApplicationProcessingState {
  New = 'new',
  ResumeProcessed = 'resume-processed',
  Completed = 'completed',
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

  @Prop({ type: [ScreeningQuestionAnswerSchema] })
  screeningQuestions: mongoose.Types.ArraySubdocument<ScreeningQuestionAnswer>;

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

  @Prop({ type: mongoose.Schema.Types.Mixed, default: [] })
  experiences: mongoose.Types.DocumentArray<CandidateExperience>;

  @Prop()
  skillScore: number;

  @Prop()
  skillSummary: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(ApplicationProcessingState),
    default: ApplicationProcessingState.New,
  })
  processingState: ApplicationProcessingState;

  @Prop()
  videoIndexId: string;

  @Prop()
  resume: string;

  @Prop()
  coverLetter: string;

  @Prop()
  videoResume: string;

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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  })
  company: CompanyDocument;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);

CandidateSchema.virtual('lastNote', {
  localField: '_id',
  foreignField: 'candidate',
  ref: 'CandidateNote',
  justOne: true,
});

CandidateSchema.index({ job: 1, email: 1 }, { unique: true });
