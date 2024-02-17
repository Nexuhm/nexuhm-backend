import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlobServiceClient } from '@azure/storage-blob';
import * as sharp from 'sharp';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
      cb(null, `${randomName}${extname(file.originalname)}`);
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
  @Post('/upload')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const { x, y, width, height } = req.body;

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
      throw new HttpException(
        'Invalid cropping details',
        HttpStatus.BAD_REQUEST,
      );

    // Image processing (cropping)
    const processedImageBuffer = await sharp(file.path)
      .extract({
        left: crop.x,
        top: crop.y,
        width: crop.width,
        height: crop.height,
      }) // Cropping
      .toBuffer();

    // Azure Blob Storage upload
    const containerName = 'assets';
    const blobName = file.filename; // Or generate a new name
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING as string,
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(processedImageBuffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });

    return {
      url: blockBlobClient.url,
    };
  }
}
