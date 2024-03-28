import { Injectable } from '@nestjs/common';
import {
  MjmlSection,
  MjmlColumn,
  MjmlText,
  render,
} from 'mjml-react';
import { MainEmailLayout } from './main-layout.template';

@Injectable()
export class InterviewInvitationEmailTemplate {
  render({ firstname, datetime, timezone }) {
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
              Hi {firstname},
            </MjmlText>

            <MjmlText>
              The interview is scheduled for {datetime} {timezone}.
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
