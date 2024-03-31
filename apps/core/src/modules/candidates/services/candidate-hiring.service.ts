import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CandidateService } from './candidate.service';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
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
import { EventsService } from '@/core/modules/events/services/events.service';

@Injectable()
export class CandidateHiringService {
  constructor(
    @InjectModel(CandidateStage.name)
    private readonly candidateStageModel: Model<CandidateStage>,
    private readonly interviewInvitationTemplate: InterviewInvitationEmailTemplate,
    private readonly candidateService: CandidateService,
    private readonly hireEmailTemplate: HireEmailTemplate,
    private readonly offerEmailTemplate: JobOfferEmailTemplate,
    private readonly emailService: EmailService,
    private readonly eventsService: EventsService,
  ) {}

  async createMeeting(
    user: UserDocument,
    candidateId: string,
    eventOptions: InterviewOptions,
  ) {
    const [isInAppliedStage, candidate] = await Promise.all([
      this.candidateStageModel.exists({
        candidate: candidateId,
        stage: RecruitmentStage.Applied,
      }),
      this.candidateService
        .findById(candidateId)
        .populate('company')
        .populate('job'),
    ]);

    if (!isInAppliedStage) {
      throw new BadRequestException('Candidate not in applied stage');
    }

    if (!candidate) {
      throw new CandidateNotFoundException();
    }

    await this.eventsService.createEvent(user, candidate, eventOptions);

    await this.candidateService.stageTransition(
      candidate.id,
      RecruitmentStage.Interview,
      eventOptions,
    );

    await this.sendInterviewInvitationEmail(candidate, eventOptions);

    await this.candidateService.createNote(
      candidateId,
      user,
      `Scheduled for ${format(
        eventOptions.startDate,
        "dd/MM/yyyy 'at' hh:mm a",
      )}`,
    );
  }

  private async sendInterviewInvitationEmail(
    candidate: CandidateDocument,
    eventOptions: InterviewOptions,
  ) {
    const formattedInterviewDate = eventOptions.startDate.toLocaleString(
      'en-US',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: eventOptions.timezone,
      },
    );

    const interviewInvitationHtml = this.interviewInvitationTemplate.render({
      name: candidate.firstname,
      datetime: formattedInterviewDate,
      timezone: eventOptions.timezone,
      interviewers: eventOptions.interviewers,
      location: eventOptions.location,
      message: eventOptions.message,
      companyName: candidate.company.name,
      jobTitle: candidate.job.title,
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
