import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InterviewOptions } from '@/core/modules/candidates/candidate.interface';
import { CandidateDocument } from '@/core/modules/candidates/schemas/candidate.schema';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import { UserIntegration } from '@/core/modules/users/schemas/user-integration.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(UserIntegration.name)
    private integrationModel: Model<UserIntegration>,
  ) {}

  async getCalendarIntegrations(user: UserDocument) {
    const integrations = await this.integrationModel.find({
      _id: {
        $in: user.integrations,
      },
      type: {
        $in: ['google', 'microsoft'],
      },
    });

    const google = integrations.find(
      (integration) => integration.type == 'google',
    );

    const microsoft = integrations.find(
      (integration) => integration.type == 'microsoft',
    );

    return {
      google,
      microsoft,
    };
  }

  async createEvent(
    user: UserDocument,
    candidate,
    eventOptions: InterviewOptions,
  ) {
    const integrations = await this.getCalendarIntegrations(user);

    if (integrations.google) {
      return this.createGoogleCalendarEvent(
        integrations.google.accessToken,
        candidate,
        eventOptions,
      );
    }

    if (integrations.microsoft) {
      return this.createMicrosoftOutlookEvent(
        integrations.microsoft?.accessToken,
        candidate,
        eventOptions,
      );
    }

    // can't create event due to absense of integrations;
    return null;
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
  }

  async getCalendarEvents(user: UserDocument) {
    const integrations = await this.getCalendarIntegrations(user);

    if (integrations.google) {
      return this.getGoogleCalendarEvents(integrations.google.accessToken);
    }

    if (integrations.microsoft) {
      return this.getOutlookCalendarEvents(integrations.microsoft.accessToken);
    }
  }

  private async getGoogleCalendarEvents(token: string) {
    const oAuth2Client = new google.auth.OAuth2();

    oAuth2Client.setCredentials({
      access_token: token,
    });

    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    const events = await calendar.events.list();

    return events.data.items?.map((event) => ({
      title: event.summary,
      date: event.start?.dateTime ? new Date(event.start?.dateTime) : null,
    }));
  }

  private async getOutlookCalendarEvents(token: string) {
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });

    const events = await client.api('/me/events').get();

    return events.value.map((event) => ({
      title: event.subject,
      date: new Date(event.start.dateTime),
    }));
  }
}
