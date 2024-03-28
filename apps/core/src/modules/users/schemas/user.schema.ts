import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { UserIntegration } from './user-integration.schema';
import { CompanyDocument } from '@/core/modules/company/schemas/company.schema';
import { UserRole } from '../types/user-role.enum';

export type UserDocument = HydratedDocument<User>;

export type SignUpMethod = 'website' | 'google' | 'linkedin' | 'microsoft';

export interface UserMetaData {
  signUpMethod: SignUpMethod;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  picture: string;

  @Prop({
    select: false,
  })
  password: string;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserIntegration',
      },
    ],
  })
  integrations: UserIntegration[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  })
  company: CompanyDocument;

  @Prop({
    type: [String],
    required: true,
  })
  roles: UserRole[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  metaData: UserMetaData;
}

export const UserSchema = SchemaFactory.createForClass(User);
