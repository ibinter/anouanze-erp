import { Module } from '@nestjs/common';
import { BeneficiairesService } from './beneficiaires.service';
import { BeneficiairesController } from './beneficiaires.controller';

@Module({
  controllers: [BeneficiairesController],
  providers: [BeneficiairesService],
  exports: [BeneficiairesService],
})
export class BeneficiairesModule {}
