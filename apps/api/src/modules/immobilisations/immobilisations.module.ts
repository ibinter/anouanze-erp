import { Module } from '@nestjs/common';
import { ImmobilisationsService } from './immobilisations.service';
import { ImmobilisationsController } from './immobilisations.controller';

@Module({
  controllers: [ImmobilisationsController],
  providers: [ImmobilisationsService],
  exports: [ImmobilisationsService],
})
export class ImmobilisationsModule {}
