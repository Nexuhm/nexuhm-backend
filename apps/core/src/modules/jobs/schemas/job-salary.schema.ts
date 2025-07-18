import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type JobSalaryDocument = HydratedDocument<JobSalary>;

export type SalaryFrequencyType = 'yearly' | 'monthly' | 'weekly' | 'hourly';

@Schema({ _id: false })
export class JobSalary {
  @Prop()
  min: number;

  @Prop()
  max: number;

  @Prop()
  currency: string;

  @Prop()
  frequency: SalaryFrequencyType;
}

export const JobSalarySchema = SchemaFactory.createForClass(JobSalary);
