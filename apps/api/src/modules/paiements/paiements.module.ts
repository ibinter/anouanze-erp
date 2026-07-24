import { Module } from '@nestjs/common';
import { PaiementsService } from './paiements.service';
import { CinetPayService } from './cinetpay.service';
import { PaiementsController } from './paiements.controller';

// ConfigModule est déclaré `isGlobal: true` dans AppModule : ConfigService est
// injectable ici sans import supplémentaire.
@Module({
  controllers: [PaiementsController],
  providers: [PaiementsService, CinetPayService],
  exports: [PaiementsService, CinetPayService],
})
export class PaiementsModule {}
