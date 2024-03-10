import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type OAuthIntegrationType = 'google' | 'linkedin' | 'microsoft';

@Schema({ timestamps: true })
export class UserIntegration {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, enum: ['google', 'linkedin', 'microsoft'] })
  type: OAuthIntegrationType;

  @Prop({ required: true })
  accessToken: string;

  @Prop()
  refreshToken?: string;
}

export const UserIntegrationSchema =
  SchemaFactory.createForClass(UserIntegration);
