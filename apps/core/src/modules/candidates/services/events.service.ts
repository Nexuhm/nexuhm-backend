import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Candidate } from '../schemas/candidate.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
  ) {}
}
