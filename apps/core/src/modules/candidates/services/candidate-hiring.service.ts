import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserIntegration } from '@/core/modules/users/schemas/user-integration.schema';
import { Model } from 'mongoose';
import { CandidateService } from './candidate.service';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import { MissingIntegrationException } from '@/core/lib/exception/missing-integration.exception';
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { format } from 'date-fns';

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
import { JobOfferEmailTemplate } from '@/core/modules/emails/templates/job-offer.template';
import { HireEmailTemplate } from '@/core/modules/emails/templates/job-hire.template';
import { InterviewInvitationEmailTemplate } from '@/core/modules/emails/templates/interview-invitation.template';
import { EmailService } from '@/core/modules/emails/services/email.service';

@Injectable()
export class CandidateHiringService {
  constructor(
    @InjectModel(UserIntegration.name)
    private integrationModel: Model<UserIntegration>,
    @InjectModel(CandidateStage.name)
    private readonly candidateStageModel: Model<CandidateStage>,
    private readonly interviewInvitationTemplate: InterviewInvitationEmailTemplate,
    private readonly candidateService: CandidateService,
    private readonly hireEmailTemplate: HireEmailTemplate,
    private readonly offerEmailTemplate: JobOfferEmailTemplate,
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
    const microsoftIntegration = integrations.find(
      (integration) => integration.type == 'microsoft',
    );

    if (!(googleIntegration || microsoftIntegration)) {
      throw new MissingIntegrationException(
        'Missing google and microsoft integration',
      );
    }

    if (googleIntegration) {
      await this.createGoogleCalendarEvent(
        googleIntegration.accessToken,
        candidate,
        interview,
      );
    } else if (microsoftIntegration) {
      await this.createMicrosoftOutlookEvent(
        microsoftIntegration.accessToken,
        candidate,
        interview,
      );
    }

    await this.candidateService.createNote(
      candidateId,
      user,
      `Scheduled for ${format(interview.startDate, "dd/MM/yyyy 'at' hh:mm a")}`,
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
        subject: 'Interview Invitation',
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

  async createFeedback(
    candidateId: string,
    user: UserDocument,
    feedback: FeedbackOptions,
  ) {
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

    const note =
      `Overall impression: ${feedback.impression}\n` +
      `Fit for the role: ${feedback.roleCompatibility}\n` +
      `Recommendation: ${feedback.recommendation}\n\n` +
      `Strengths and Weaknesses: ${feedback.strengthsAndWeaknesses}`;

    await this.candidateService.createNote(candidateId, user, note);
  }

  async createOffer(
    candidateId: string,
    user: UserDocument,
    offer: OfferOptions,
  ) {
    const candidate = await this.candidateService.findById(candidateId);

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (candidate.stage != RecruitmentStage.Awaiting) {
      throw new BadRequestException("Candidate isn't in awaiting stage");
    }

    await this.candidateService.stageTransition(
      candidateId,
      RecruitmentStage.Offer,
      offer,
    );

    const note =
      `Position title: ${offer.positionTitle}\n` +
      `Start date: ${format(offer.startDate, 'dd/MM/yyyy')}\n` +
      `Salary: ${offer.salary}\n\n` +
      `Benefits overview: ${offer.benefits}`;

    await this.candidateService.createNote(candidateId, user, note);

    const formattedInterviewDate = offer.startDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    const jobOfferEmail = this.offerEmailTemplate.render({
      firstname: candidate.firstname,
      position: offer.positionTitle,
      salary: offer.salary,
      startDate: formattedInterviewDate,
    });

    await this.emailService.sendEmail({
      from: 'noreply@nexuhm.com',
      content: {
        subject: "You've got and offer in Nexuhm",
        html: jobOfferEmail.html,
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

  async reject(candidateId: string) {
    await this.candidateService.stageTransition(
      candidateId,
      RecruitmentStage.Rejected,
    );
  }

  async hireCandidate(
    candidateId: string,
    user: UserDocument,
    hireData: HireOptions,
  ) {
    const candidate = await this.candidateService.findById(candidateId);

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (candidate.stage != RecruitmentStage.Offer) {
      throw new BadRequestException('Candidate not in offer stage');
    }

    await this.candidateService.stageTransition(
      candidateId,
      RecruitmentStage.Hired,
      hireData,
    );

    const note =
      `Position title: ${hireData.positionTitle}\n` +
      `Start date: ${format(hireData.startDate, 'dd/MM/yyyy')}\n` +
      `Salary: ${hireData.salary}\n\n` +
      `Please move this candidate into your HR software to onboard into your company. If you don’t have a HR system, reach out to the candidate.`;

    await this.candidateService.createNote(candidateId, user, note);

    const hireEmail = this.hireEmailTemplate.render({
      firstname: candidate.firstname,
      position: hireData.positionTitle,
    });

    await this.emailService.sendEmail({
      from: 'noreply@nexuhm.com',
      content: {
        subject: "Congratulations, you've been hired!",
        html: hireEmail.html,
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
}
