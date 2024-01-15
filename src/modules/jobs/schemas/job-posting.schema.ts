import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class JobPosting {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  employmentType: string;

  @Prop()
  salary: number;
}

export const JobPostingSchema = SchemaFactory.createForClass(JobPosting);
