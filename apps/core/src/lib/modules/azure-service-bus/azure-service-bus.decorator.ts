import { Inject } from '@nestjs/common';

export function Sender(queue: string) {
  return Inject(`AZURE_SB_SENDER_${queue.toUpperCase()}`);
}

export function Receiver(queue: string) {
  return Inject(`AZURE_SB_RECEIVER_${queue.toUpperCase()}`);
}
