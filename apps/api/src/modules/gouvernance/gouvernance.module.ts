import { Module } from '@nestjs/common';
import { GouvernanceController } from './gouvernance.controller';
import { GouvernanceService } from './gouvernance.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GouvernanceController],
  providers: [GouvernanceService],
})
export class GouvernanceModule {}
