import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ProspectsController, ProspectsPublicController } from './prospects.controller';
import { ProspectsService } from './prospects.service';
import { RelancesCron } from './relances.cron';

@Module({
  imports: [PrismaModule],
  controllers: [ProspectsPublicController, ProspectsController],
  providers: [ProspectsService, RelancesCron],
  exports: [ProspectsService],
})
export class ProspectsModule {}
