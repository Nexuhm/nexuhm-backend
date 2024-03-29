import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType } from 'mongoose';
import { User, UserDocument } from '@/core/modules/users/schemas/user.schema';
import { UserIntegration } from '../schemas/user-integration.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserIntegration.name)
    private readonly integrationModel: Model<UserIntegration>,
  ) {}

  /**
   * Creates a new user with the given fields. If no company is provided in the fields,
   * a new company is created for the user with a default name based on their first name.
   */
  async create(fields: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(fields);
  }

  findOne(...args): Promise<UserDocument | null> {
    return this.userModel.findOne(...args);
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
      _id: {
        $in: user.integrations,
      },
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
