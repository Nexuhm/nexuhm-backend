import { Receiver } from '@/core/lib/modules/azure-service-bus/azure-service-bus.decorator';
import { CandidateService } from '@/core/modules/candidates/services/candidate.service';
import { ServiceBusReceiver } from '@azure/service-bus';
import { Injectable } from '@nestjs/common';
import { CompanyService } from '@/core/modules/company/services/company.service';
import { JobsService } from '@/core/modules/jobs/services/jobs.service';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  JsonOutputParser,
  StringOutputParser,
} from '@langchain/core/output_parsers';
import { ApplicationProcessingState } from '@/core/modules/candidates/schemas/candidate.schema';
import { WinstonLoggerService } from '@/core/lib/modules/logger/logger.service';
import { FileProcessingService } from './file-processing.service';

@Injectable()
export class CandiateProcessingService {
  constructor(
    @Receiver('candidate-resume-processing-queue')
    private readonly resumeProcessingReciver: ServiceBusReceiver,
    private readonly candidateService: CandidateService,
    private readonly companyService: CompanyService,
    private readonly jobsService: JobsService,
    private readonly logger: WinstonLoggerService,
    private readonly fileProcessingService: FileProcessingService,
  ) {}

  onModuleInit() {
    this.resumeProcessingReciver.subscribe({
      processMessage: async (message) => {
        const { candidateId } = JSON.parse(message.body);
        const candidate = await this.candidateService.findById(candidateId);
        const job = await this.jobsService.findById(candidate?.job);
        const company = await this.companyService.findById(candidate?.company);

        if (!candidate) {
          return;
        }

        const resumeContent = await this.fileProcessingService.parseFile(
          candidate.resume,
        );

        const [description, experiences, scoreSummary] = await Promise.all([
          this.getGeneralDescription(
            job!.description,
            company!.cultureDescription,
            resumeContent,
          ),
          this.parseExperiences(resumeContent),
          this.getScoreSummary(
            job!.description,
            company!.cultureDescription,
            resumeContent,
          ),
        ]);

        const score = this.getTotalScore(
          scoreSummary.cultureScore,
          scoreSummary.skillsScore,
        );

        await candidate.updateOne({
          description,
          experiences,
          score: score,
          skillScore: scoreSummary.skillsScore,
          skillSummary: scoreSummary.skillsSummary,
          cultureScore: scoreSummary.cultureScore,
          cultureSummary: scoreSummary.cultureSummary,
          processingState: ApplicationProcessingState.Completed,
        });

        this.logger.log(`${candidate.email} resume has been processed.`);
      },
      processError: async (args) => {
        console.log(
          `Error occurred with ${args.entityPath} within ${args.fullyQualifiedNamespace}: `,
          args.error,
        );
      },
    });
  }

  getTotalScore(skillScore: number, cultureScore: number) {
    return (skillScore + cultureScore) / 2;
  }

  async getScoreSummary(
    jobDescription: string,
    companyCulture: string,
    resume: string,
  ): Promise<any> {
    const model = this.createModel();

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `
          As an experienced recruiter, your task is to evaluate the candidates' skills by resumes and conduct an analysis focusing on the mentioned experience, skills and culture.
          You will receive details of the job description.

          Your scoring should reflect the alignment of the candidates with the job description, the skills required for the positions and culture fit. 
          Assign scores ranging from 1 to 10.

          STEPS.

          1. Analyse resume to find out key features and details related to candidate.

          2. Create a bullet points for each criteria for scoring.

          3. Return JSON output in the following format:
        
          SCHEMA:
          -------
          {{
            cultureScore: float, // candidate's culture score,
            cultureSummary: string, // a brief explanation of the criteria you used to determine the skills score, should be plain text.
            skillsScore: float, // candidate's skills score,
            skillsSummary: string, // a brief explanation of the criteria you used to determine the culture score, should be plain text.
          }}
        `,
      ],
      [
        'user',
        `
        JOB DESCRIPTION:
        ---------------
        {jobDescription}

        COMPANY CULTURE:
        ---------------
        {companyCulture}

        RESUME:
        {resume}
      `,
      ],
    ]);

    const chain = prompt.pipe(model).pipe(new JsonOutputParser());

    const result = await chain.invoke({
      jobDescription,
      companyCulture,
      resume,
    });

    return result;
  }

  async getGeneralDescription(
    jobDescription: string,
    companyCulture: string,
    resume: string,
  ): Promise<any> {
    const model = new ChatOpenAI({
      modelName: 'gpt-4-1106-Preview',
      temperature: 0,
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIBasePath: process.env.AZURE_OPENAI_BASE_PATH,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
      azureOpenAIApiDeploymentName: 'candidate-analyzer',
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `
          As an experienced recruiter, your task is to summarize and give a description of the candidates' resume relative to job description and company culture.
          You should conduct an analysis focusing on the mentioned experience and skills.
          You will receive details of the job description and the company culture. 

          The summary should be around 200-300 words and should highlight the key points of the resume that align with the job description and the company culture.

          Your tone should be professional and informative, yet concise.

          REQUIREMENT:
          The result should be in a plain text.
        `,
      ],
      [
        'user',
        `
        JOB DESCRIPTION
        ---------------
        {jobDescription}

        COMPANY CULTURE
        ---------------
        {companyCulture}

        RESUME:
        {resume}
      `,
      ],
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const result = await chain.invoke({
      jobDescription,
      companyCulture,
      resume,
    });

    return result;
  }

  async parseExperiences(resume: string): Promise<any> {
    const model = this.createModel();

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `
          Please extract the job experiences from the provided text.
          Focuse on the job position, start year, end year, and the organization.
          Organize the extracted information in a JSON format with the following schema:

          REQUIREMENT:
          - You need give a list of experiences found in RESUNE.
          - You CAN NOT make up anything other than given context. Your extraction should be based only on RESUME.

          STEPS:

          1. Analyse resume and find out what experiences user had.
          2. Parse data based on the given SCHEMA.
        
          SCHEMA:
          -------
          {{
            experiences: [
              {{
                jobPosition: string, // The job title or position held by the candidate.
                startDate: date, // The date the candidate started the position.
                endDate: date, // The date the candidate ended the position; if the position is current, use null.
                organization: string // The name of the organization or company where the position was held.
                summary: string // Summary of achievements and experiences gained during the employment.
              }}
            ]
          }}

          EXAMPLE:

          [
            {{
              "jobPosition": "Software Engineer",
              "startDate": 2018-03-25,
              "endDate": null,
              "organization": "Tech Solutions Inc"
            }},
            {{
              "jobPosition": "Junior Developer",
              "startDate": 2016-01-03,
              "endDate": 2018-03-25,
              "organization": "Innovative Web Solutions"
              "summary": "Worked on medium load applications, gained experience in areas such as Spark, Hadoop and Databricks."
            }}
          ]
        `,
      ],
      [
        'user',
        `
        RESUME:
        {resume}
      `,
      ],
    ]);

    const chain = prompt.pipe(model).pipe(new JsonOutputParser());

    const result: any = await chain.invoke({
      resume,
    });

    return result?.experiences || [];
  }

  private createModel() {
    const model = new ChatOpenAI({
      modelName: 'gpt-4-1106-Preview',
      modelKwargs: {
        response_format: {
          type: 'json_object',
        },
      },
      temperature: 0,
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIBasePath: process.env.AZURE_OPENAI_BASE_PATH,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
      azureOpenAIApiDeploymentName: 'candidate-analyzer',
    });

    return model;
  }
}
