import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';

@Global()
@Module({
  providers: [EmailService, EmailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
