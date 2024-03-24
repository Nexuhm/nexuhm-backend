import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { HydratedDocument } from 'mongoose';

export type PasswordResetTokenDocument = HydratedDocument<PasswordResetToken>;

export type SignUpMethod = 'website' | 'google' | 'linkedin' | 'microsoft';

@Schema({ timestamps: true })
export class PasswordResetToken {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true, default: randomUUID })
  token: string;

  @Prop()
  createdAt: Date;
}

export const PasswordResetTokenSchema =
  SchemaFactory.createForClass(PasswordResetToken);

PasswordResetTokenSchema.index(
  { email: 1, token: 1 },
  {
    unique: true,
  },
);
