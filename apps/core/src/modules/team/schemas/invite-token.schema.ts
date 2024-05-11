import { randomUUID } from 'crypto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import { CompanyDocument } from '@/core/modules/company/schemas/company.schema';
import { UserRole } from '@/core/modules/users/types/user-role.enum';

export type InviteTokenDocument = HydratedDocument<InviteToken>;

@Schema({ timestamps: true })
export class InviteToken {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  inviter: UserDocument;

  @Prop({ required: true })
  email: string;

  @Prop({
    ref: 'Company',
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  company: CompanyDocument;

  @Prop({
    type: String,
    required: true,
    enum: [UserRole.Owner, UserRole.Recruiter],
  })
  role: UserRole;

  @Prop({
    type: String,
    default: () => randomUUID(),
    required: true,
  })
  token: string;

  @Prop()
  createdAt: Date;
}

export const InviteTokenSchema = SchemaFactory.createForClass(InviteToken);
