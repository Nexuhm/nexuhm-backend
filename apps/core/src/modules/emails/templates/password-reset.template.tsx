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
export class PasswordResetEmailTemplate {
  render({ firstname, token }) {
    return render(
      <MainEmailLayout subject="Password Reset Request">
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
              <p>
                We received a request to reset the password for your Nexuhm
                account associated with this email address. If you did not
                request this change, please ignore this email. No changes will
                be made to your account.
              </p>

              <p style={{ marginBottom: 0 }}>
                To reset your password, please follow the instructions below:
              </p>
            </MjmlText>

            <MjmlButton
              href={`${process.env.PASSWORD_RESET_URL}?token=${token}`}
              backgroundColor="#006EDF"
            >
              Reset Your Password
            </MjmlButton>

            <MjmlText>
              <p>
                Please note that this link will expire in 15 minutes, after
                which you will need to restart the password reset process.
              </p>
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
