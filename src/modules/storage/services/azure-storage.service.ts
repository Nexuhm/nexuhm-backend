import { Injectable } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

@Injectable()
export class AzureStorageService {
  private containerClient: ContainerClient;

  constructor() {
    const containerName = 'assets';
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING as string,
    );
    this.containerClient = blobServiceClient.getContainerClient(containerName);
  }

  async uploadBlob(blobName: string, data: Buffer, mimetype?: string) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(data, {
      blobHTTPHeaders: { blobContentType: mimetype },
    });

    return blockBlobClient;
  }
}
