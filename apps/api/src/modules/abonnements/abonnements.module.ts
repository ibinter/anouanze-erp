import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AbonnementsController } from './abonnements.controller';
import { AbonnementsService } from './abonnements.service';

@Module({
  imports: [PrismaModule],
  controllers: [AbonnementsController],
  providers: [AbonnementsService],
  exports: [AbonnementsService],
})
export class AbonnementsModule {}
