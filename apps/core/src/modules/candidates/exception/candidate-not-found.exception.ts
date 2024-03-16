export class CandidateNotFoundException extends Error {
  constructor(msg: string = 'Candidate not found') {
    super(msg);
    this.name = 'CandidateNotFoundException';
  }
}