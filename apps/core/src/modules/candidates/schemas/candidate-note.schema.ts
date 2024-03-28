import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { RecruitmentStage } from './candidate.schema';

export type CandidateNoteDocument = HydratedDocument<CandidateNote>;

@Schema({ timestamps: true })
export class CandidateNote {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  note: string;

  @Prop({ type: String })
  type?: RecruitmentStage;

  @Prop({ ref: 'User', type: mongoose.Schema.Types.ObjectId })
  author?: UserDocument;

  @Prop({ ref: 'User', type: mongoose.Schema.Types.ObjectId })
  candidate: string;

  @Prop()
  createdAt: Date;
}

export const CandidateNoteSchema = SchemaFactory.createForClass(CandidateNote);
