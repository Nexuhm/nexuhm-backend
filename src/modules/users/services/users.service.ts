import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType } from 'mongoose';
import { User, UserDocument } from '@/modules/users/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  create(fields: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(fields);
  }

  findByEmail(
    email: string,
    projection?: ProjectionType<User>,
  ): Promise<UserDocument> {
    return this.userModel.findOne({ email }, projection);
  }

  findById(
    _id: string,
    projection?: ProjectionType<User>,
  ): Promise<UserDocument> {
    return this.userModel.findById(_id, projection);
  }
}
