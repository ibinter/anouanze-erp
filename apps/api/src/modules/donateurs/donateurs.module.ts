import { Module } from '@nestjs/common';
import { DonateursController } from './donateurs.controller';
import { DonateursService } from './donateurs.service';

@Module({
  controllers: [DonateursController],
  providers: [DonateursService],
  exports: [DonateursService],
})
export class DonateursModule {}
