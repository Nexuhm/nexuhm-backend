import { Injectable } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as mammoth from 'mammoth';
import * as path from 'path';
import { WinstonLoggerService } from '@/core/lib/modules/logger/logger.service';

@Injectable()
export class FileProcessingService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async downloadFileAsBuffer(fileUrl: string): Promise<Buffer> {
    const response = await lastValueFrom(
      this.httpService.get(fileUrl, { responseType: 'arraybuffer' }),
    );

    return Buffer.from(response.data);
  }

  async parsePdf(fileUrl: string) {
    const buffer = await this.downloadFileAsBuffer(fileUrl);
    const pdf = await pdfParse(buffer);
    const resumeContent = pdf.text;
    return resumeContent;
  }

  async parseDocx(fileUrl: string) {
    const buffer = await this.downloadFileAsBuffer(fileUrl);
    const result = await mammoth.extractRawText({ buffer });
    const resumeContent = result.value;
    return resumeContent;
  }

  async parseFile(fileUrl: string) {
    try {
      const format = path.extname(fileUrl);

      if (format.startsWith('.docx')) {
        return this.parseDocx(fileUrl);
      }

      if (format.startsWith('.pdf')) {
        return this.parsePdf(fileUrl);
      }
    } catch (err) {
      this.logger.warn(err);
    }

    return null;
  }
}
