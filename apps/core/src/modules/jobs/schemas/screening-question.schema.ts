import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ScreeningQuestionDocument = HydratedDocument<ScreeningQuestion>;

export type ScreeingQuestionType = 'text' | 'video';

@Schema()
export class ScreeningQuestion {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  title: string;

  @Prop({ type: String })
  type: ScreeingQuestionType;
}

export const ScreeningQuestionSchema =
  SchemaFactory.createForClass(ScreeningQuestion);
