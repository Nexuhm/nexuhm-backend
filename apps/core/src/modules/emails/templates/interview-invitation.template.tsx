import { Injectable } from '@nestjs/common';
import { MjmlSection, MjmlColumn, MjmlText, render } from 'mjml-react';
import { MainEmailLayout } from './main-layout.template';

@Injectable()
export class InterviewInvitationEmailTemplate {
  render({
    name,
    companyName,
    jobTitle,
    datetime,
    timezone,
    interviewers,
    location,
    message,
  }) {
    return render(
      <MainEmailLayout subject="Interview invitation">
        <MjmlSection padding={0}>
          <MjmlColumn>
            <MjmlText
              fontSize={20}
              fontWeight={700}
              padding={25}
              paddingBottom={0}
            >
              Dear {name},
            </MjmlText>

            <MjmlText>
              We are please to confirm your interview with {companyName} for the{' '}
              {jobTitle} position.
            </MjmlText>

            <MjmlText>Here are the details of your interviews:</MjmlText>

            <MjmlText>
              <p>
                <strong>Date:</strong> {datetime}
              </p>

              <p>
                <strong>Link:</strong> {location}
              </p>

              <p>
                <strong>Interviewers:</strong> {interviewers?.join(', ')}
              </p>

              {message && (
                <p>
                  <strong>Format:</strong> {message}
                </p>
              )}
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </MainEmailLayout>,
      {
        validationLevel: 'soft',
      },
    );
  }
}
