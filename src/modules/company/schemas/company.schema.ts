import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true })
export class Company {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  name: string;

  @Prop({ unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop()
  cultureDescription: string;

  @Prop()
  address: string;

  @Prop()
  companySize: string;

  @Prop()
  industry: string;

  @Prop()
  website: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
