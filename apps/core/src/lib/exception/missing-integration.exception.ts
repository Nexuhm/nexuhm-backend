export class MissingIntegrationException extends Error {
  constructor(msg: string = 'Missing integration') {
    super(msg);
    this.name = 'MissingIntegrationException;'
  }
}