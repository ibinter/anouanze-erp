import { Global, Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ConfigurationTestService } from './configuration-test.service';
import { ConfigurationController } from './configuration.controller';

/**
 * Module global : `ConfigurationService` est injectable partout sans import
 * explicite (paiements, email, IA…) exactement comme `PrismaService`.
 */
@Global()
@Module({
  controllers: [ConfigurationController],
  providers: [ConfigurationService, ConfigurationTestService],
  exports: [ConfigurationService, ConfigurationTestService],
})
export class ConfigurationModule {}
