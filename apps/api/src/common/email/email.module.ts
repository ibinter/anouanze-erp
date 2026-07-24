import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { EmailRetentionService } from './email-retention.service';

@Global()
@Module({
  providers: [EmailService, EmailProcessor, EmailRetentionService],
  exports: [EmailService],
})
export class EmailModule {}
