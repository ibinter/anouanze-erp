import { Module } from '@nestjs/common';
import { BailleursController } from './bailleurs.controller';
import { BailleursService } from './bailleurs.service';

@Module({
  controllers: [BailleursController],
  providers: [BailleursService],
  exports: [BailleursService],
})
export class BailleursModule {}
