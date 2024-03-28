import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { UserDocument } from './user.schema';
import { randomUUID } from 'crypto';
import { CompanyDocument } from '@/core/modules/company/schemas/company.schema';
import { UserRole } from '../types/user-role.enum';

export type InviteTokenDocument = HydratedDocument<InviteToken>;

@Schema({ timestamps: true })
export class InviteToken {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
  })
  inviter: UserDocument;

  @Prop({
    ref: 'Company',
    type: mongoose.Schema.Types.ObjectId,
  })
  company: CompanyDocument;

  @Prop({
    type: String,
  })
  role: UserRole;

  @Prop({
    type: String,
    default: randomUUID,
  })
  token: string;

  @Prop()
  createdAt: Date;
}

export const InviteTokenSchema = SchemaFactory.createForClass(InviteToken);
