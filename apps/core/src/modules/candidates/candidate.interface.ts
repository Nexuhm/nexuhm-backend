import {
  RoleCompatibility,
  FeedbackImpression,
  FeedbackRecommendation,
} from './candidate.enum';

export interface InterviewOptions {
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
  roleCompatibility: RoleCompatibility;
  recommendation: FeedbackRecommendation;
}

export interface OfferOptions {
  positionTitle: string;
  startDate: Date;
  salary: string;
  benefits: string;
}

export interface HireOptions {
  positionTitle: string;
  startDate: Date;
  salary: string;
}
