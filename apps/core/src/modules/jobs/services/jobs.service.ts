import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JobPosting } from '../schemas/job-posting.schema';
import { AnyKeys, FilterQuery, Model } from 'mongoose';
import { JobGenerationDto } from '../dto/job-generation.dto';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { Company } from '@/core/modules/company/schemas/company.schema';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(JobPosting.name)
    private readonly jobPostingModel: Model<JobPosting>,
    @InjectModel(Company.name)
    private readonly companyModel: Model<Company>,
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

  findByIdAndUpdate(...args) {
    return this.jobPostingModel.findByIdAndUpdate(...args);
  }

  findBySlug(slug: string) {
    return this.jobPostingModel.findOne({ slug }).populate('company', 'slug');
  }

  create(fields: AnyKeys<JobPosting>) {
    return this.jobPostingModel.create(fields);
  }

  async generateJobPosting(fields: JobGenerationDto, user: UserDocument) {
    const company = await this.companyModel.findById(user.company);

    const model = new ChatOpenAI({
      modelName: 'gpt-35-turbo-1106',
      modelKwargs: {
        response_format: {
          type: 'json_object',
        },
      },
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIBasePath: process.env.AZURE_OPENAI_BASE_PATH,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
      azureOpenAIApiDeploymentName: 'job-generator',
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `
          You are an experienced recruiter. You can create well defined job postings from given fields:
          
          - \`title\`,  
          - \`description\` 
          - \`companyDescription\` 
          - \`cultureDescription\`

          Create well defined, engaging job posting.

          You need to go over following steps during the process to achieve best results.

          Step 1.
          Fix user search INPUT, adjust it for further NLP processing, it may contain typos. 

          Step 3.
          Analyze given company description and culture description to create a job description aligning with company business needs.

          Step 3.
          Use following JSON schema and generate posting fields.

          IMPORTANT CONSIDERATIONS:
          -------------------------
          - If isStealth is true, then generate job posting without company details.

          REQUIREMENTS:
          ------------
          - You SHOULD USE given locale to generate job description. 
            I.e. if locale is "en-US" then generate job description in US English, if locale is "en-GB" then generate job description in UK English.
          - You SHOULD NOT make up any stuff that isn't related to given \`title\` and \`description\`.
          - You SHOULD follow user instructions to generate job description.
          - YOU CAN NOT generate anything illegal or harmful.
          - Only return the JSON fields with values. i.e., DROP all fields with null and "". 

          SCHEMA:
          -------
          {{
            title: string // well defined Job Title,
            description: string // brief description of the job, make sure to optimize for SEO.
            content: string // Generate a MARKDOWN content of the job posting, it should include sections such as Overview, Benefits etc. make sure formatting is well defined and attratcive, Shouldn't include title at the top.
            isStealth: boolean // If true, then hide company details.
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
              currency: // default to GBP, based on location can be EUR and USD
              frequency: string, // Salary paycheck period, Enum Values {{weekly | monthly | yearly | hourly}}
            }}
          }}
        `,
      ],
      [
        'user',
        `
        COMPANY DESCRIPTION:
        --------------------
        {companyDescription}

        COMPANY CULTURE:
        ---------------
        {cultureDescription}

        IS STEALTH: {isStealth}

        QUERY:
        -----

        Title: {title}
        Description: {description}
        Locale: {locale}
      `,
      ],
    ]);

    const chain = prompt.pipe(model).pipe(new JsonOutputParser());

    const result: any = await chain.invoke({
      ...fields,
      cultureDescription: company?.cultureDescription,
      companyDescription: company?.description,
    });

    return {
      ...result,
      isStealth: fields.isStealth,
    };
  }
}
