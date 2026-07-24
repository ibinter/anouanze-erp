import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { DecimalSerializerInterceptor } from './common/interceptors/decimal-serializer.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganisationsModule } from './modules/organisations/organisations.module';
import { UtilisateursModule } from './modules/utilisateurs/utilisateurs.module';
import { MembresModule } from './modules/membres/membres.module';
import { DonateursModule } from './modules/donateurs/donateurs.module';
import { BailleursModule } from './modules/bailleurs/bailleurs.module';
import { ProjetsModule } from './modules/projets/projets.module';
import { BeneficiairesModule } from './modules/beneficiaires/beneficiaires.module';
import { RhModule } from './modules/rh/rh.module';
import { ComptabiliteModule } from './modules/comptabilite/comptabilite.module';
import { BudgetModule } from './modules/budget/budget.module';
import { TresorerieModule } from './modules/tresorerie/tresorerie.module';
import { AchatsModule } from './modules/achats/achats.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { EvenementsModule } from './modules/evenements/evenements.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { AuditModule } from './modules/audit/audit.module';
import { PaiementsModule } from './modules/paiements/paiements.module';
import { IaModule } from './modules/ia/ia.module';
import { MealModule } from './modules/meal/meal.module';
import { ImmobilisationsModule } from './modules/immobilisations/immobilisations.module';
import { GouvernanceModule } from './modules/gouvernance/gouvernance.module';
import { NotificationsRestModule } from './modules/notifications-rest/notifications-rest.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ImportModule } from './modules/import/import.module';
import { ProspectsModule } from './modules/prospects/prospects.module';
import { AbonnementsModule } from './modules/abonnements/abonnements.module';
import { StorageModule } from './common/storage/storage.module';
import { OrganisationGuard } from './common/guards/organisation.guard';
import { EmailModule } from './common/email/email.module';
import { QueueModule } from './common/queue/queue.module';
import { NotificationsModule } from './common/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{ ttl: 60000, limit: config.get('RATE_LIMIT', 100) }],
      }),
    }),

    ScheduleModule.forRoot(),

    CacheModule.register({
      isGlobal: true,
      ttl: 300000,
      max: 1000,
    }),

    PrismaModule,
    StorageModule,
    // Files BullMQ (Redis) — dégradation sûre si REDIS_URL absent/injoignable.
    QueueModule,
    EmailModule,
    NotificationsModule,

    // Modules métier
    AuthModule,
    OrganisationsModule,
    UtilisateursModule,
    MembresModule,
    DonateursModule,
    BailleursModule,
    ProjetsModule,
    BeneficiairesModule,
    RhModule,
    ComptabiliteModule,
    BudgetModule,
    TresorerieModule,
    AchatsModule,
    StocksModule,
    DocumentsModule,
    CommunicationModule,
    EvenementsModule,
    ReportingModule,
    AuditModule,
    PaiementsModule,
    IaModule,
    MealModule,
    ImmobilisationsModule,
    GouvernanceModule,
    NotificationsRestModule,
    TicketsModule,
    ImportModule,
    ProspectsModule,
    AbonnementsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: DecimalSerializerInterceptor },
    // Traduit les messages d'erreur selon l'en-tête Accept-Language
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    Reflector,
    OrganisationGuard,
  ],
})
export class AppModule {}
