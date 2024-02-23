import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpException,
  HttpStatus,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import * as sharp from 'sharp';
import { Request } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { promises as fs } from 'fs';

export const multerConfig = {
  storage: diskStorage({
    // Destination is a function that tells multer where to save the incoming files
    destination: '/tmp/nexuhm-uploads', // specify the directory to store the files
    filename: (req, file, cb) => {
      // Generate a unique filename
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      // Call the callback function with null (for no error) and the generated filename with its original extension
      cb(null, `${randomName}${path.extname(file.originalname)}`);
    },
  }),
  // Optionally, you can add file size limits, file filter functions etc.
  limits: {
    fileSize: 1024 * 1024 * 5, // for example, limiting file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // You can reject a file in case you want to filter out file types, for instance
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      // Allow image formats only
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  },
};

@Controller('/media')
export class MediaController {
  private containerClient: ContainerClient;

  constructor() {
    const containerName = 'assets';
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING as string,
    );
    this.containerClient = blobServiceClient.getContainerClient(containerName);
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    try {
      const { enableCropping, filename, folder = '/' } = req.body;

      const imageBuffer = enableCropping
        ? await cropImage(file, req.body)
        : await fs.readFile(file.path);

      const compressedImage = await compressImage(imageBuffer);

      // Azure Blob Storage upload
      const blobName = filename || file.filename;
      const blockBlobClient = this.containerClient.getBlockBlobClient(
        path.join(folder, blobName),
      );

      await blockBlobClient.uploadData(compressedImage, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });

      return {
        url: blockBlobClient.url,
      };
    } catch (err) {
      throw new BadRequestException();
    } finally {
      await fs.rm(file.path);
    }
  }

  @Post('/delete')
  async deleteMedia(@Body('url') url: string) {
    const blobName = url.split('/assets/').pop();
    const blockBlobClient = this.containerClient.getBlockBlobClient(
      blobName as string,
    );
    await blockBlobClient.deleteIfExists();
  }
}

async function compressImage(file: Buffer) {
  const image = await sharp(file);
  const meta = await image.metadata();
  const { format } = meta;

  const configs = {
    jpeg: { quality: 80 },
    webp: { quality: 80 },
    png: { quality: 80 },
  };

  const formatConfig = configs[format!];
  const compressedImage = await image[format!](formatConfig);
  return compressedImage.toBuffer();
}

async function cropImage(file, { y, x, width, height }) {
  // Parse crop details
  const crop = {
    x: parseInt(x, 10),
    y: parseInt(y, 10),
    width: parseInt(width, 10),
    height: parseInt(height, 10),
  };

  if (!file)
    throw new HttpException('File is required', HttpStatus.BAD_REQUEST);

  // Ensure crop details are provided
  if (!crop.width || !crop.height)
    throw new HttpException('Invalid cropping details', HttpStatus.BAD_REQUEST);

  // Image processing (cropping)
  const processedImageBuffer = await sharp(file.path)
    .extract({
      left: crop.x,
      top: crop.y,
      width: crop.width,
      height: crop.height,
    }) // Cropping
    .toBuffer();

  return processedImageBuffer;
}
