import { Global, Module } from '@nestjs/common';
import { EmailQueueService } from './email-queue.service';

/**
 * Module transverse des files BullMQ.
 *
 * Il n'expose que le *producteur* : le *worker* est déclaré dans le module
 * fonctionnel concerné (EmailModule) afin d'éviter toute dépendance circulaire.
 */
@Global()
@Module({
  providers: [EmailQueueService],
  exports: [EmailQueueService],
})
export class QueueModule {}
