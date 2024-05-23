import { Injectable } from '@nestjs/common';
import {
  Mjml,
  MjmlHead,
  MjmlBody,
  MjmlTitle,
  MjmlPreview,
  MjmlSection,
  MjmlColumn,
  MjmlDivider,
  MjmlText,
  MjmlFont,
  MjmlStyle,
  render,
  MjmlWrapper,
  MjmlImage,
} from 'mjml-react';

@Injectable()
export class ApplicationSuccessTemplate {
  render({ logo, username, companyName }) {
    return render(
      <Mjml>
        <MjmlHead>
          <MjmlTitle>Thank you for yout Application</MjmlTitle>
          <MjmlPreview></MjmlPreview>

          <MjmlFont
            name="Poppins"
            href="https://fonts.googleapis.com/css?family=Poppins"
          />

          <MjmlStyle>
            {`
                * {
                    font-family: Poppins, sans-serif;
                }

                p {
                    font-size: 1rem;
                    margin-top: 0;
                    margin-bottom: 24px;
                    color: #1C1C1E;
                    line-height: 24px;
                }

                p:last-child {
                    margin-bottom: 0;
                }

                .body {
                    padding-top: 40px;
                    padding-bottom: 40px;
                }

                .main-section {
                    background-color: white;
                    border-radius: 16px;
                }

                .logo {
                    max-width: 200px;
                    max-height: 80px;
                }
            `}
          </MjmlStyle>
        </MjmlHead>
        <MjmlBody cssClass=".body" backgroundColor="#FAFAFA">
          <MjmlWrapper paddingTop={40} paddingBottom={40}>
            <MjmlWrapper cssClass="main-section">
              <MjmlSection padding={0} textAlign="left">
                <MjmlColumn cssClass="logo">
                  <MjmlImage src={logo} />
                </MjmlColumn>
              </MjmlSection>

              <MjmlSection padding={0}>
                <MjmlColumn>
                  <MjmlText fontSize={32} fontWeight={700} paddingBottom={16}>
                    Thank you for your Application
                  </MjmlText>
                </MjmlColumn>
              </MjmlSection>

              <MjmlSection padding={0}>
                <MjmlColumn>
                  <MjmlText>
                    <p style={{ marginBottom: 16 }}>Dear, {username}</p>
                    <p style={{ marginBottom: 16 }}>
                      Thank you for your interest in the UX Designer position at
                      {companyName}. We have successfully received your
                      application and our recruitment team is ready to review
                      it.
                    </p>
                    <p>
                      We take pride in selected the best for our business, so It
                      may take us a few days before we can come back to you.
                    </p>
                  </MjmlText>
                </MjmlColumn>
              </MjmlSection>

              <MjmlSection padding={0}>
                <MjmlColumn>
                  <MjmlDivider borderWidth="1px" borderColor="lightgrey" />
                </MjmlColumn>
              </MjmlSection>

              <MjmlSection padding={0}>
                <MjmlColumn>
                  <MjmlText>
                    <p>
                      Kind regards,
                      <br />
                      Recruitment Team
                      <br />
                      {companyName}
                    </p>

                    <p>
                      Should you need to get in contact with us please email
                      hello@nexuhm.com
                    </p>
                  </MjmlText>
                </MjmlColumn>
              </MjmlSection>
            </MjmlWrapper>

            <MjmlWrapper>
              <MjmlSection>
                <MjmlColumn>
                  <MjmlText align="center" fontSize={14}>
                    <p>
                      Copyright © {new Date().getFullYear()} Company. All
                      rights reserved.
                    </p>
                  </MjmlText>
                </MjmlColumn>
              </MjmlSection>
            </MjmlWrapper>
          </MjmlWrapper>
        </MjmlBody>
      </Mjml>,
      {
        validationLevel: 'soft',
      },
    );
  }
}
