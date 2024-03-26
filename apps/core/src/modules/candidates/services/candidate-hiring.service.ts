import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserIntegration } from '../../users/schemas/user-integration.schema';
import { Model } from 'mongoose';
import { CandidateService } from './candidate.service';
import { UserDocument } from '../../users/schemas/user.schema';
import { MissingIntegrationException } from '@/core/lib/exception/missing-integration.exception';
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import {
  CandidateDocument,
  RecruitmentStage,
} from '../schemas/candidate.schema';
import {
  FeedbackOptions,
  OfferOptions,
  InterviewOptions,
  HireOptions,
} from '../candidate.interface';
import { CandidateStage } from '../schemas/candidate-stage.schema';
import { CandidateNotFoundException } from '../exception/candidate-not-found.exception';
import { InterviewInvitationEmailTemplate } from '../../emails/templates/interview-invitation.template';
import { EmailService } from '../../emails/services/email.service';

@Injectable()
export class CandidateHiringService {
  constructor(
    @InjectModel(UserIntegration.name)
    private integrationModel: Model<UserIntegration>,
    private interviewInvitationTemplate: InterviewInvitationEmailTemplate,
    @InjectModel(CandidateStage.name)
    private readonly candidateStageModel: Model<CandidateStage>,
    private readonly candidateService: CandidateService,
    private readonly emailService: EmailService,
  ) {}

  async createMeeting(
    user: UserDocument,
    candidateId: string,
    interview: InterviewOptions,
  ) {
    const [isInAppliedStage, candidate] = await Promise.all([
      this.candidateStageModel.exists({
        candidate: candidateId,
        stage: RecruitmentStage.Applied,
      }),
      this.candidateService.findById(candidateId),
    ]);

    if (!isInAppliedStage) {
      throw new BadRequestException('Candidate not in applied stage');
    }

    if (!candidate) {
      throw new CandidateNotFoundException();
    }

    const integrations = await this.integrationModel.find({
      _id: {
        $in: user.integrations,
      },
      type: {
        $in: ['google', 'microsoft'],
      },
    });

    const googleIntegration = integrations.find(
      (integration) => integration.type == 'google',
    );

    if (googleIntegration) {
      return this.createGoogleCalendarEvent(
        googleIntegration.accessToken,
        candidate,
        interview,
      );
    }

    const microsoftIntegration = integrations.find(
      (integration) => integration.type == 'microsoft',
    );

    if (microsoftIntegration) {
      return this.createMicrosoftOutlookEvent(
        microsoftIntegration.accessToken,
        candidate,
        interview,
      );
    }

    throw new MissingIntegrationException(
      'Missing google and microsoft integration',
    );
  }

  private async createMicrosoftOutlookEvent(
    token: string,
    candidate: CandidateDocument,
    interview: InterviewOptions,
  ) {
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });

    const meetingEvent = {
      subject: `Interview Meeting with ${candidate?.firstname} ${candidate?.lastname}`,
      body: {
        contentType: 'text',
        content: interview.message,
      },
      start: {
        dateTime: interview.startDate.toISOString(),
        timeZone: interview.timezone,
      },
      end: {
        dateTime: interview.endDate.toISOString(),
        timeZone: interview.timezone,
      },
      attendees: [
        {
          emailAddress: {
            address: candidate?.email,
          },
        },
        ...interview.interviewers.map((interviewer) => ({
          emailAddress: {
            address: interviewer,
          },
        })),
      ],
      location: {
        displayName: interview.location,
      },
    };

    await client.api('/me/events').post(meetingEvent);

    await this.candidateService.stageTransition(
      candidate.id,
      RecruitmentStage.Interview,
      interview,
    );

    await this.sendInterviewInvitationEmail(candidate, interview);
  }

  private async createGoogleCalendarEvent(
    token: string,
    candidate: CandidateDocument,
    interview: InterviewOptions,
  ) {
    const oAuth2Client = new google.auth.OAuth2();

    oAuth2Client.setCredentials({
      access_token: token,
    });

    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    const meetingEvent = {
      summary: `Interview Meeting with ${candidate?.firstname} ${candidate?.lastname}`,
      description: interview.message,
      start: {
        dateTime: interview.startDate.toISOString(),
        timeZone: interview.timezone,
      },
      end: {
        dateTime: interview.endDate.toISOString(),
        timeZone: interview.timezone,
      },
      attendees: [
        {
          email: candidate?.email,
        },
        ...interview.interviewers.map((interviewer) => ({
          email: interviewer,
        })),
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
      location: interview.location,
    };

    await calendar.events.insert(
      {
        auth: oAuth2Client,
        calendarId: 'primary',
        requestBody: meetingEvent,
      },
      {
        responseType: 'json',
      },
    );

    await this.candidateService.stageTransition(
      candidate.id,
      RecruitmentStage.Interview,
      interview,
    );

    await this.sendInterviewInvitationEmail(candidate, interview);
  }

  private async sendInterviewInvitationEmail(
    candidate: CandidateDocument,
    interview: InterviewOptions,
  ) {
    const formattedInterviewDate = interview.startDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: interview.timezone,
    });

    const interviewInvitationHtml = this.interviewInvitationTemplate.render({
      firstname: candidate.firstname,
      datetime: formattedInterviewDate,
      timezone: interview.timezone,
    });

    await this.emailService.sendEmail({
      from: 'noreply@nexuhm.com',
      content: {
        subject: 'Interview invitation',
        html: interviewInvitationHtml.html,
      },
      recipients: {
        to: [
          {
            address: candidate.email,
            displayName: `${candidate.firstname} ${candidate.lastname}`,
          },
        ],
      },
    });
  }

  async createFeedback(candidateId: string, feedback: FeedbackOptions) {
    const isInInterviewStage = await this.candidateStageModel.exists({
      candidate: candidateId,
      stage: RecruitmentStage.Interview,
    });

    if (!isInInterviewStage) {
      throw new BadRequestException('Candidate not in interview stage');
    }

    await this.candidateService.stageTransition(
      candidateId,
      RecruitmentStage.Awaiting,
      feedback,
    );
  }

  async createOffer(candidateId: string, offer: OfferOptions) {
    const isInAwaitingStage = await this.candidateStageModel.exists({
      candidate: candidateId,
      stage: RecruitmentStage.Awaiting,
    });

    if (!isInAwaitingStage) {
      throw new BadRequestException('Candidate not in awaiting stage');
    }

    await this.candidateService.stageTransition(
      candidateId,
      RecruitmentStage.Offer,
      offer,
    );
  }

  async reject(candidateId: string) {
    await this.candidateService.stageTransition(
      candidateId,
      RecruitmentStage.Rejected,
    );
  }

  async hireCandidate(candidateId: string, hireData: HireOptions) {
    const isInOfferStage = await this.candidateStageModel.exists({
      candidate: candidateId,
      stage: RecruitmentStage.Offer,
    });

    if (!isInOfferStage) {
      throw new BadRequestException('Candidate not in offer stage');
    }

    await this.candidateService.stageTransition(
      candidateId,
      RecruitmentStage.Hired,
      hireData,
    );
  }
}
