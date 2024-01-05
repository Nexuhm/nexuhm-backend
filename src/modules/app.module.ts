import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
  ],
})
export class AppModule {}
