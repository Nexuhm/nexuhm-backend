import { Injectable } from '@nestjs/common';
import {
  MjmlSection,
  MjmlColumn,
  MjmlText,
  render,
} from 'mjml-react';
import { MainEmailLayout } from './main-layout.template';

@Injectable()
export class JobOfferEmailTemplate {
  render({ firstname, position, salary, startDate }) {
    return render(
      <MainEmailLayout subject="Job offer">
        <MjmlSection padding={0}>
          <MjmlColumn>
            <MjmlText>Job Offer for {position}</MjmlText>
            <MjmlText>Dear {firstname},</MjmlText>
            <MjmlText>I'm pleased to offer you the position of {position} with a starting salary of {salary} and a start date of {startDate}.</MjmlText>
            <MjmlText>Please let me know if you accept this offer, and we'll proceed with the necessary paperwork.</MjmlText>
            <MjmlText>Looking forward to having you join our team!</MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </MainEmailLayout>,
      {
        validationLevel: 'soft',
      },
    );
  }
}
