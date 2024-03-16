export interface ICandidateScheduleMeeting {
  startDate: Date;
  endDate: Date;
  timezone: string;
  interviewers: Array<string>;
  location?: string;
  message?: string;
}