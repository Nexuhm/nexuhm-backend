export interface ScheduleMeetingOptions {
  startDate: Date;
  endDate: Date;
  timezone: string;
  interviewers: Array<string>;
  location?: string;
  message?: string;
}
