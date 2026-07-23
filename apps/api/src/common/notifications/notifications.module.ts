import { Module, Global } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationEventsService } from './notification-events.service';

@Global()
@Module({
  providers: [NotificationsGateway, NotificationEventsService],
  exports: [NotificationsGateway, NotificationEventsService],
})
export class NotificationsModule {}
