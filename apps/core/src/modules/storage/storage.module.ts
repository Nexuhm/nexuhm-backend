import { Module } from '@nestjs/common';
import { MediaController } from './controllers/storage.controller';
import { AzureStorageService } from './services/azure-storage.service';

@Module({
  imports: [],
  exports: [AzureStorageService],
  providers: [AzureStorageService],
  controllers: [MediaController],
})
export class StorageModule {}
