import { Injectable } from "@nestjs/common";
import { ICandidateScheduleMeeting } from "../candidate.inerface";
import { InjectModel } from "@nestjs/mongoose";
import { UserIntegration } from "../../users/schemas/user-integration.schema";
import { Model } from "mongoose";
import { CandidateService } from "./candidate.service";
import { UserDocument } from "../../users/schemas/user.schema";
import { MissingIntegrationException } from "../../../common/exception/missing-integration.exception";
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { CandidateDocument } from "../schemas/candidate.schema";
import { CandidateNotFoundException } from "../exception/candidate-not-found.exception";

@Injectable()
export class CandidateHiringService {
  constructor(
    @InjectModel(UserIntegration.name) private integrationModel: Model<UserIntegration>,
    private readonly candidateService: CandidateService,
  ) {}

  async scheduleMeetingWithCandidate(user: UserDocument, candidateId: string, schedule: ICandidateScheduleMeeting) {
    console.log('schedule => ', schedule)
    const candidate = await this.candidateService.findById(candidateId);

    if (!candidate) throw new CandidateNotFoundException();

    const integrations = await this.integrationModel
      .find({
        _id: {
          $in: user.integrations,
        },
        type: {
          $in: ['google', 'microsoft'],
        },
      });

    const googleIntegration = integrations.find(integration => integration.type == 'google');
    const microsoftIntegration = integrations.find(integration => integration.type == 'microsoft');

    if (googleIntegration) {
      await this.scheduleMeetingGoogle(googleIntegration.accessToken, candidate, schedule)
    }
    else if (microsoftIntegration) {
      await this.scheduleMeetingMicrosoft(microsoftIntegration.accessToken, candidate, schedule)
    }
    else {
      throw new MissingIntegrationException('Missing google and microsoft integration');
    }
  }

  private async scheduleMeetingMicrosoft(token: string, candidate: CandidateDocument, schedule: ICandidateScheduleMeeting) {
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });

    const meetingEvent = {
      subject: `Interview Meeting with ${candidate?.firstname} ${candidate?.lastname}`,
      body: {
        contentType: 'text',
        content: schedule.message,
      },
      start: {
        dateTime: schedule.startDate.toISOString(),
        timeZone: schedule.timezone,
      },
      end: {
        dateTime: schedule.endDate.toISOString(),
        timeZone: schedule.timezone,
      },
      attendees: [
        {
          emailAddress: {
            address: candidate?.email,
          },
        },
        ...schedule.interviewers.map(interviewer => ({
          emailAddress: {
            address: interviewer,
          },
        }))
      ],
      location: {
        displayName: schedule.location,
      },
    };

    await client.api('/me/events').post(meetingEvent);
  }

  private async scheduleMeetingGoogle(token: string, candidate: CandidateDocument, schedule: ICandidateScheduleMeeting) {
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
      description: schedule.message,
      start: {
        dateTime: schedule.startDate.toISOString(),
        timeZone: schedule.timezone,
      },
      end: {
        dateTime: schedule.endDate.toISOString(),
        timeZone: schedule.timezone,
      },
      attendees: [
        {
          email: candidate?.email,
        },
        ...schedule.interviewers.map(interviewer => ({
          email: interviewer
        }))
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
      location: schedule.location,
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
  }
}