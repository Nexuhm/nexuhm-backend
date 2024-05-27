import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CompanyDocument } from './company.schema';

export type CareersPageDocument = HydratedDocument<CareersPage>;

@Schema({ timestamps: true })
export class CareersPage {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  })
  company: CompanyDocument;

  @Prop([String])
  heroImages: string[];

  @Prop([String])
  mediaGallery: string[];

  @Prop()
  title: string;

  @Prop()
  workplaceCulture: string;

  @Prop()
  companyMission: string;

  @Prop({ type: [mongoose.Schema.Types.Mixed] })
  companyValues: string[];

  @Prop({ type: [mongoose.Schema.Types.Mixed] })
  companyBenefits: string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  socialLinks: {
    linkedin: string;
    twitter: string;
    facebook: string;
  };
}

export const CareersPageSchema = SchemaFactory.createForClass(CareersPage);
