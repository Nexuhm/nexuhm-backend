import { Injectable } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import { ChatOpenAI } from '@langchain/openai';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class CandidateService {
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
}
