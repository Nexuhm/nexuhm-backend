import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { RecruitmentStage } from './candidate.schema';
import {
  FeedbackOptions,
  HireOptions,
  OfferOptions,
} from '../candidate.interface';

@Schema({ timestamps: true })
export class CandidateStage {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String, enum: Object.values(RecruitmentStage) })
  stage: RecruitmentStage;

  @Prop({
    required: true,
    ref: 'Candidate',
    type: mongoose.Schema.Types.ObjectId,
  })
  candidate: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  data: FeedbackOptions | OfferOptions | HireOptions;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CandidateStageSchema =
  SchemaFactory.createForClass(CandidateStage);
