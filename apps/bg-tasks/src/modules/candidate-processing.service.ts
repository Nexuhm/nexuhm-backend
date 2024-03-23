import { Receiver } from '@/core/lib/modules/azure-service-bus/azure-service-bus.decorator';
import { CandidateService } from '@/core/modules/candidates/services/candidate.service';
import { VideoAnalysisService } from '@/core/modules/candidates/services/video-analysis.service';
import { ServiceBusReceiver } from '@azure/service-bus';
import { Injectable } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as mammoth from 'mammoth';
import * as path from 'path';
import { CompanyService } from '@/core/modules/company/services/company.service';
import { JobsService } from '@/core/modules/jobs/services/jobs.service';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ApplicationProcessingState } from '@/core/modules/candidates/schemas/candidate.schema';

@Injectable()
export class CandiateProcessingService {
  constructor(
    @Receiver('candidate-processing-queue')
    private readonly receiver: ServiceBusReceiver,
    private readonly candidateService: CandidateService,
    private readonly companyService: CompanyService,
    private readonly jobsService: JobsService,
    private readonly videoAnalyzerService: VideoAnalysisService,
    private readonly httpService: HttpService,
  ) {}

  onModuleInit() {
    this.receiver.subscribe({
      processMessage: async (message) => {
        const data = JSON.parse(message.body);
        const candidate = await this.candidateService.findById(
          data.candidateId,
        );
        const job = await this.jobsService.findById(candidate?.job);
        const company = await this.companyService.findById(job?.company);

        if (!candidate) {
          return;
        }

        const accessToken = await this.videoAnalyzerService.getAccessToken();
        const videoTranscripts =
          await this.videoAnalyzerService.getVideoCaptions(
            candidate.videoIndexId,
            accessToken,
          );

        const resumeContent = await this.parseFile(candidate.resume);
        const coverLetterContent = await this.parseFile(candidate.coverLetter);

        const videoScore = await this.getVideoScore(
          job!.description,
          company!.cultureDescription,
          videoTranscripts,
        );

        const resumeScore = await this.getResumeScore(
          job!.description,
          company!.cultureDescription,
          resumeContent,
        );

        const coverLetterScore = await this.getCoverLetterScore(
          job!.description,
          company!.cultureDescription,
          coverLetterContent,
        );

        const experiences = await this.parseExperiences(resumeContent);

        await candidate.updateOne({
          experiences,
          cultureScore: (coverLetterScore.score + videoScore.score) / 2,
          cultureSummary: `${coverLetterScore.summary}\n\n${videoScore.summary}`,
          skillScore: resumeScore.score,
          skillSummary: resumeScore.summary,
          processingState: ApplicationProcessingState.Completed,
        });

        candidate.experience = experiences;
      },
      processError: async (args) => {
        console.log(
          `Error occurred with ${args.entityPath} within ${args.fullyQualifiedNamespace}: `,
          args.error,
        );
      },
    });
  }

  async downloadFileAsBuffer(fileUrl: string): Promise<Buffer> {
    const response = await lastValueFrom(
      this.httpService.get(fileUrl, { responseType: 'arraybuffer' }),
    );

    return Buffer.from(response.data);
  }

  async getVideoScore(
    jobDescription: string,
    companyCulture: string,
    videoTranscripts: string,
  ): Promise<any> {
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
          As an experienced recruiter, your task is to evaluate candidates' video resume transcripts and perform a sentiment analysis of the video. 
          You will be provided with details of the job description and the company culture.
        
          Your scoring should be based on how well the candidates align with the job description and the company's culture. Assign scores ranging from 1 to 10.
        
          You need to return JSON output in following format:
        
          SCHEMA:
          -------
          {{
            score: float, // candidate's video score,
            summary: string, // a brief explanation of the criteria you used to determine the score
          }}
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

        VIDEO TRANSCRIPTS:
        {videoTranscripts}
      `,
      ],
    ]);

    const chain = prompt.pipe(model).pipe(new JsonOutputParser());

    const result = await chain.invoke({
      jobDescription,
      companyCulture,
      videoTranscripts,
    });

    return result;
  }

  async getResumeScore(
    jobDescription: string,
    companyCulture: string,
    resume: string,
  ): Promise<any> {
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
          As an experienced recruiter, your task is to evaluate the candidates' resumes and conduct an analysis focusing on the mentioned experience and skills.
          You will receive details of the job description and the company culture.
          Your scoring should reflect the alignment of the candidates with the job description and the skills required for the positions. 
          Assign scores ranging from 1 to 10.
        
          Please return the JSON output in the following format:
        
          SCHEMA:
          -------
          {{
            score: float, // candidate's video score,
            summary: string, // a brief explanation of the criteria you used to determine the score
          }}
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

    const chain = prompt.pipe(model).pipe(new JsonOutputParser());

    const result = await chain.invoke({
      jobDescription,
      companyCulture,
      resume,
    });

    return result;
  }

  async getCoverLetterScore(
    jobDescription: string,
    companyCulture: string,
    coverLetter: string,
  ): Promise<any> {
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
          As an experienced recruiter, your task is to evaluate the candidates' resumes and conduct an analysis focusing on the mentioned experience and skills.
          You will receive details of the job description and the company culture.
          Your scoring should reflect the alignment of the candidates with the job description and the skills required for the positions. 
          Assign scores ranging from 1 to 10.
        
          Please return the JSON output in the following format:
        
          SCHEMA:
          -------
          {{
            score: float, // candidate's video score,
            summary: string, // a brief explanation of the criteria you used to determine the score
          }}
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

        COVER LETTER:
        {coverLetter}
      `,
      ],
    ]);

    const chain = prompt.pipe(model).pipe(new JsonOutputParser());

    const result = await chain.invoke({
      jobDescription,
      companyCulture,
      coverLetter,
    });

    return result;
  }

  async parseExperiences(resume: string): Promise<any> {
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
          Please extract the job experiences from the provided text.
          Focuse on the job position, start year, end year, and the organization.
          Organize the extracted information in a JSON format with the following schema:

          REQUIREMENT:
          - You need give a list of experiences found in RESUNE.
          - You CAN NOT make up anything other than given context. Your extraction should be based only on RESUME.

          STEPS:

          1. Analyse resume and find out what experiences user had.
          2. Parse data based on given SCHEMA.
        
          SCHEMA:
          -------
          [
            {{
              jobPosition: string, // The job title or position held by the candidate.
              startYear: number, // The year the candidate started the position.
              endYear: number, // The year the candidate ended the position; if the position is current, use null.
              organization: string // The name of the organization or company where the position was held.
              summary: string // Summary of achievements and experiences gained during the employment.
            }}
          ]

          EXAMPLE:

          [
            {{
              "jobPosition": "Software Engineer",
              "startYear": 2018,
              "endYear": null,
              "organization": "Tech Solutions Inc"
            }},
            {{
              "jobPosition": "Junior Developer",
              "startYear": 2016,
              "endYear": 2018,
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

    const result = await chain.invoke({
      resume,
    });

    return result;
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
    const format = path.extname(fileUrl);

    if (format.startsWith('.docx')) {
      return this.parseDocx(fileUrl);
    }

    if (format.startsWith('.pdf')) {
      return this.parsePdf(fileUrl);
    }

    return null;
  }
}
