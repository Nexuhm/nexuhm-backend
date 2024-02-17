import { Module } from '@nestjs/common';
import { AccountController } from './controllers/account.controller';
import { UsersModule } from '../users/users.module';
import { AccountService } from './services/account.service';

@Module({
  imports: [UsersModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
