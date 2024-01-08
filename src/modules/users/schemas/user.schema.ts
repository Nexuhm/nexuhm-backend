import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedArraySubdocument, HydratedDocument } from 'mongoose';
import { UserIntegration } from './user-integration.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class UserPassword {
  @Prop({ required: true })
  hash: string;

  @Prop({ required: true })
  salt: string;
}

export const UserPasswordSchema = SchemaFactory.createForClass(UserPassword);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: number;

  @Prop({ required: true })
  email: string;

  @Prop({
    type: UserPassword,
    select: false,
  })
  password: UserPassword;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserIntegration',
      },
    ],
  })
  integrations: UserIntegration[];
}

export const CatSchema = SchemaFactory.createForClass(User);
