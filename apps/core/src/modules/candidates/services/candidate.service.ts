import { Injectable } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import { ChatOpenAI } from '@langchain/openai';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { InjectModel } from '@nestjs/mongoose';
import { Candidate, RecruitmentStage } from '../schemas/candidate.schema';
import { AnyKeys, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import { CandidateNote } from '../schemas/candidate-note.schema';
import {
  CandidateStage,
  CandidateStageType,
} from '../schemas/candidate-stage.schema';

@Injectable()
export class CandidateService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
    @InjectModel(CandidateNote.name) private noteModel: Model<CandidateNote>,
    @InjectModel(CandidateStage.name)
    private readonly candidateStageModel: Model<CandidateStage>,
  ) {}

  find(filters: FilterQuery<Candidate> = {}) {
    return this.candidateModel.find(filters);
  }

  count(filters: FilterQuery<Candidate> = {}) {
    return this.candidateModel.countDocuments(filters);
  }

  findById(id: string) {
    return this.candidateModel.findById(id);
  }

  update(filter: FilterQuery<Candidate>, update: UpdateQuery<Candidate>) {
    return this.candidateModel.updateMany(filter, update);
  }

  async createNote(candidateId: string, author: UserDocument, content: string) {
    const candidate = await this.findById(candidateId);

    const note = await this.noteModel.create({
      candidate,
      author,
      note: content,
    });

    await candidate?.updateOne({
      $addToSet: {
        notes: note,
      },
    });

    return {
      author: note.author
        ? `${note.author.firstname} ${note.author.lastname}`
        : 'Nexuhm',
      note: note.note,
      createdAt: note.createdAt,
    };
  }

  async getNotes(candidateId: string) {
    const notes = await this.noteModel
      .find({
        candidate: candidateId,
      })
      .populate('author', 'firstname lastname')
      .sort('-createdAt');

    return notes.map((note) => ({
      author: note.author
        ? `${note.author.firstname} ${note.author.lastname}`
        : 'Nexuhm',
      note: note.note,
      createdAt: note.createdAt,
    }));
  }

  async getStages(candidateId: string) {
    return this.candidateStageModel
      .find({
        candidate: candidateId,
      })
      .select({
        _id: 0,
        stage: 1,
        createdAt: 1,
      });
  }

  async parseResume(file: Buffer) {
    const pdf = await pdfParse(file);
    const resumeContent = pdf.text;

    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-0125',
      modelKwargs: {
        response_format: {
          type: 'json_object',
        },
      },
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `
          You are a resume analyzer. You can parse useful infromation for recruiment process from resumes or CVs.

          REQUIREMENTS:
          ------------
          You SHOULD NOT make up any stuff that isn't related to given \`title\` and \`description\`.
          Only return the JSON fields with values. i.e., DROP all fields with null and "". 

          Step 1: 
          Parse relevant information based on SCHEMA

          Step 2:
          Normalize parsed values, i.e. capitalize firstname and lastname, properly format email etc.

          SCHEMA:
          -------
          {{
            firstname: string // email of the candidate,
            lastname: string // email of the candidate,
            email: string // email of the candidate,
            location: string // location of the candidate
            phone: string // phone number of the candidate
          }}
        `,
      ],
      [
        'user',
        `
        RESUME:
        -----

        {resumeContent}
      `,
      ],
    ]);

    const chain = prompt.pipe(model).pipe(new JsonOutputParser());

    const result = await chain.invoke({ resumeContent });

    return result;
  }

  public async stageTransition(
    candidateId: string,
    stage: RecruitmentStage,
    data?: CandidateStageType,
  ) {
    await this.candidateStageModel.create({
      candidate: candidateId,
      stage,
      data,
    });

    await this.candidateModel.updateOne(
      {
        _id: candidateId,
      },
      {
        stage,
      },
    );
  }

  async create(candidate: AnyKeys<Candidate>) {
    const createdCandidate = await this.candidateModel.create(candidate);

    await this.stageTransition(createdCandidate.id, RecruitmentStage.Applied);

    return createdCandidate;
  }
}
