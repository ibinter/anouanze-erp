import { Module } from '@nestjs/common';
import { PaiementsService } from './paiements.service';
import { CinetPayService } from './cinetpay.service';
import { PaiementsController } from './paiements.controller';

// `ConfigurationModule` est déclaré `@Global()` dans AppModule :
// `ConfigurationService` est injectable ici sans import supplémentaire.
@Module({
  controllers: [PaiementsController],
  providers: [PaiementsService, CinetPayService],
  exports: [PaiementsService, CinetPayService],
})
export class PaiementsModule {}
