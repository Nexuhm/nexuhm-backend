import { Receiver } from '@/core/lib/modules/azure-service-bus/azure-service-bus.decorator';
import { ServiceBusReceiver } from '@azure/service-bus';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CandiateProcessingService {
  constructor(
    @Receiver('candidate-processing-queue')
    private readonly receiver: ServiceBusReceiver,
  ) {}

  onModuleInit() {
    this.receiver.subscribe({
      processMessage: async (message) => {
        console.log(JSON.parse(message.body));
      },
      processError: async (args) => {
        console.log(
          `Error occurred with ${args.entityPath} within ${args.fullyQualifiedNamespace}: `,
          args.error,
        );
      },
    });
  }
}
