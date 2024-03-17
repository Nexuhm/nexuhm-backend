import {
  RoleCompatibility,
  FeedbackImpression,
  FeedbackRecommendation,
} from './candidate.enum';

export interface ScheduleMeetingOptions {
  startDate: Date;
  endDate: Date;
  timezone: string;
  interviewers: Array<string>;
  location?: string;
  message?: string;
}

export interface FeedbackOptions {
  impression: FeedbackImpression;
  strengthsAndWeaknesses: string;
  fitForTheRole: RoleCompatibility;
  recommendation: FeedbackRecommendation;
}
