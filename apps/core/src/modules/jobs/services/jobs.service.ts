import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JobPosting } from '../schemas/job-posting.schema';
import { AnyKeys, FilterQuery, Model } from 'mongoose';
import { JobGenerationDto } from '../dto/job-generation.dto';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(JobPosting.name)
    private readonly jobPostingModel: Model<JobPosting>,
  ) {}

  findOne(fields: FilterQuery<JobPosting>) {
    return this.jobPostingModel.findOne(fields);
  }

  find(fields: FilterQuery<JobPosting>) {
    return this.jobPostingModel.find(fields);
  }

  findById(id) {
    return this.jobPostingModel.findById(id);
  }

  findBySlug(slug: string) {
    return this.jobPostingModel.findOne({ slug });
  }

  create(fields: AnyKeys<JobPosting>) {
    return this.jobPostingModel.create(fields);
  }

  async generateJobPosting(fields: JobGenerationDto) {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-1106',
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
          You are an experienced recruiter. You can create well defined job postings from a \`title\` and \`description\`.
          Create well defined, engaging job posting.

          You need to go over following steps during the process to achieve best results.

          Step 1.
          Fix user search INPUT, adjust it for further NLP processing, it may contain typos. 

          Step 2.
          Use following JSON schema and generate posting fields.

          REQUIREMENTS:
          ------------
          You SHOULD NOT make up any stuff that isn't related to given \`title\` and \`description\`.
          You SHOULD follow user instructions to generate job description.
          YOU CAN NOT generate anything illegal or harmful.
          Only return the JSON fields with values. i.e., DROP all fields with null and "". 

          SCHEMA:
          -------
          {{
            title: string // well defined Job Title,
            description: string // brief description of the job, make sure to optimize for SEO.
            content: string // Generate a MARKDOWN content of the job posting, it should include sections such as Overview, Benefits etc. make sure formatting is well defined and attratcive
            employmentType: string /*
              Enum Values:
              full-time-employment,
              part-time-employment,
              freelance,
              contractual,
              temporary-employment,
              internship,
              volunteer-work,
              seasonal-work,
            */
            location: string // job location provided by user
            salary: {{ // salary range
              min: number, // minimum salary
              max: number // maxiumum salary
              frequency: string, // Salary paycheck period, Enum Values {{weekly | monthly | yearly}}
            }}
          }}
        `,
      ],
      [
        'user',
        `
        QUERY:
        -----

        Title: {title}
        Description: {description}
      `,
      ],
    ]);

    const chain = prompt.pipe(model).pipe(new JsonOutputParser());

    const result = await chain.invoke(fields);

    return result;
  }
}
