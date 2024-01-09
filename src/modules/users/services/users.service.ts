import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType } from 'mongoose';
import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import { UserIntegration } from '../schemas/user-integration.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserIntegration.name)
    private readonly integrationModel: Model<UserIntegration>,
  ) {}

  create(fields: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(fields);
  }

  findByEmail(
    email: string,
    projection?: ProjectionType<User>,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }, projection);
  }

  findById(
    _id: string,
    projection?: ProjectionType<User>,
  ): Promise<UserDocument | null> {
    return this.userModel.findById(_id, projection);
  }

  async createIntegration(
    user: UserDocument,
    integration: Omit<UserIntegration, '_id'>,
  ) {
    const existing = await this.integrationModel.findOne({
      user,
      type: integration.type,
    });

    // update existing integration
    if (existing) {
      await existing.updateOne(integration);
    } else {
      // create an integration and add to user document
      const newIntegration = await this.integrationModel.create(integration);

      await user.updateOne({
        $addToSet: {
          integrations: newIntegration._id,
        },
      });
    }
  }
}
