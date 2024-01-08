import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class UserIntegration {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, enum: ['google', 'linkedin', 'microsoft'] })
  type: 'google' | 'linkedin' | 'microsoft';

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  accessToken: string;
}

export const UserIntegrationSchema =
  SchemaFactory.createForClass(UserIntegration);
