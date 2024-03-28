import { Injectable } from '@nestjs/common';
import { MjmlSection, MjmlColumn, MjmlText, render } from 'mjml-react';
import { MainEmailLayout } from './main-layout.template';

@Injectable()
export class HireEmailTemplate {
  render({ firstname, position }) {
    return render(
      <MainEmailLayout subject="Congratulations, you've been hired">
        <MjmlSection padding={0}>
          <MjmlColumn>
            <MjmlText>
              Congratulations {firstname}, you are hired for the {position}{' '}
              position
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
