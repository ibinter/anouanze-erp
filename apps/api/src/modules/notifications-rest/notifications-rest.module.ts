import { Module } from '@nestjs/common';
import { NotificationsRestController } from './notifications-rest.controller';
import { NotificationsRestService } from './notifications-rest.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsRestController],
  providers: [NotificationsRestService],
  exports: [NotificationsRestService],
})
export class NotificationsRestModule {}
