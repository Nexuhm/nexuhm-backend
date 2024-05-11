import { Injectable } from '@nestjs/common';
import {
  MjmlSection,
  MjmlColumn,
  MjmlText,
  render,
  MjmlButton,
} from 'mjml-react';
import { MainEmailLayout } from './main-layout.template';

@Injectable()
export class TeamInvitationEmailTemplate {
  render({ companyName, role, link }) {
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
              Hi,
            </MjmlText>

            <MjmlText>
              You are invited to join {companyName} as a {role}. Please click
              the link below to accept the invitation.
            </MjmlText>

            <MjmlButton href={link} backgroundColor="#006EDF">
              Accept invitation
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MainEmailLayout>,
      {
        validationLevel: 'soft',
      },
    );
  }
}
