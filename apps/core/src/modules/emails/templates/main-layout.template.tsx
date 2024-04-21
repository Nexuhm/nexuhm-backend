import { ReactNode } from 'react';
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
  MjmlWrapper,
  MjmlImage,
} from 'mjml-react';

interface MainEmailLayoutProps {
  subject: string;
  disableFooter?: boolean;
  preview?: string;
  children: ReactNode;
}

export function MainEmailLayout({
  subject,
  preview,
  disableFooter = false,
  children,
}: MainEmailLayoutProps) {
  return (
    <Mjml>
      <MjmlHead>
        <MjmlTitle>{subject}</MjmlTitle>
        <MjmlPreview>{preview}</MjmlPreview>

        <MjmlFont
          name="Poppins"
          href="https://fonts.googleapis.com/css?family=Poppins"
        />

        <MjmlStyle>
          {`
                * {
                    font-family: Poppins, sans-serif;
                }

                p, .paragraph {
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
                    max-width: 140;
                    max-height: 40px;
                }
            `}
        </MjmlStyle>
      </MjmlHead>
      <MjmlBody cssClass=".body" backgroundColor="#f5f5fe">
        <MjmlWrapper paddingTop={40} paddingBottom={40}>
          <MjmlWrapper cssClass="main-section">
            <MjmlSection padding={0} textAlign="left" paddingBottom={30}>
              <MjmlColumn cssClass="logo">
                <MjmlImage
                  src="https://nexuhmstaging.blob.core.windows.net/assets/images/logo.png"
                  width={181.5}
                  height={40}
                />
              </MjmlColumn>
            </MjmlSection>

            {children}

            <MjmlSection padding={0}>
              <MjmlColumn>
                <MjmlDivider borderWidth="1px" borderColor="lightgrey" />
              </MjmlColumn>
            </MjmlSection>

            {!disableFooter && (
              <MjmlSection padding={0}>
                <MjmlColumn>
                  <MjmlText>
                    <p>
                      Should you need to get in contact with us please email
                      support@nexuhm.com
                    </p>
                  </MjmlText>
                </MjmlColumn>
              </MjmlSection>
            )}
          </MjmlWrapper>

          <MjmlWrapper>
            <MjmlSection>
              <MjmlColumn>
                <MjmlText align="center" fontSize={14}>
                  <p>
                    Copyright © {new Date().getFullYear()} Nexuhm Ltd. All
                    rights reserved.
                  </p>
                </MjmlText>
              </MjmlColumn>
            </MjmlSection>
          </MjmlWrapper>
        </MjmlWrapper>
      </MjmlBody>
    </Mjml>
  );
}
