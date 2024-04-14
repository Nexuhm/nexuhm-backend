import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ScreeingQuestionType } from '@/core/modules/jobs/schemas/screening-question.schema';

@Schema()
export class ScreeningQuestionAnswer {
  _id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  question: mongoose.Types.ObjectId;

  @Prop()
  value: string;

  @Prop({ type: String })
  type: ScreeingQuestionType;
}

export const ScreeningQuestionAnswerSchema = SchemaFactory.createForClass(
  ScreeningQuestionAnswer,
);
