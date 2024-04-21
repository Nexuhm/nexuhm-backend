import { Injectable } from '@nestjs/common';
import { MjmlSection, MjmlColumn, MjmlText, render } from 'mjml-react';
import { MainEmailLayout } from './main-layout.template';

@Injectable()
export class MessageTemplate {
  render({ subject, email, name, message }) {
    return render(
      <MainEmailLayout subject={subject} disableFooter>
        <MjmlSection padding={0}>
          <MjmlColumn>
            <MjmlText fontSize={24} fontWeight={600} paddingBottom={16}>
              {subject}
            </MjmlText>
            <MjmlText fontSize={16} fontWeight={600}>
              {name}
            </MjmlText>
            <MjmlText fontSize={16} fontWeight={600}>
              {email}
            </MjmlText>
            <MjmlText fontSize={16} lineHeight="120%">
              {message}
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
