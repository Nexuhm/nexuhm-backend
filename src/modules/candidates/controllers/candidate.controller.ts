import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidateService } from '../services/candidate.service';

@Controller('/candidates')
export class CandidateController {
  constructor(private candidateSevrice: CandidateService) {}

  @Post('/parse-resume')
  @UseInterceptors(FileInterceptor('file'))
  async parseResume(@UploadedFile() file: Express.Multer.File) {
    return this.candidateSevrice.parseResume(file.buffer);
  }
}
