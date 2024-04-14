import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class ScreeningQuestionAnswer {
  _id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  question: mongoose.Types.ObjectId;

  @Prop()
  value: string;
}

export const ScreeningQuestionAnswerSchema = SchemaFactory.createForClass(
  ScreeningQuestionAnswer,
);
