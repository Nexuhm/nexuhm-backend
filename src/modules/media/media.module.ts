import { Module } from '@nestjs/common';
import { MediaController } from './controllers/media.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [MediaController],
})
export class MediaModule {}
