import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/** Rétention par défaut du journal d'emails, en jours. */
export const DEFAULT_EMAIL_LOG_RETENTION_DAYS = 90;

/** Garde-fous : jamais moins de 7 jours, jamais plus de 3 ans. */
const MIN_RETENTION_DAYS = 7;
const MAX_RETENTION_DAYS = 1095;

/** Nombre maximal de lignes supprimées par exécution (évite un verrou long). */
const PURGE_BATCH_SIZE = 5000;

/**
 * Purge de rétention du journal d'emails (`email_logs`).
 *
 * Exigence RGPD/minimisation : les traces d'envoi (destinataire, sujet)
 * ne sont conservées que le temps nécessaire au diagnostic. Au-delà de
 * `EMAIL_LOG_RETENTION_DAYS` jours (90 par défaut), les entrées sont
 * supprimées.
 *
 * Garanties : la tâche est entièrement encapsulée dans un `try/catch`,
 * n'expose aucune donnée personnelle dans les journaux (seuls des compteurs)
 * et ne peut jamais interrompre l'application — au pire elle ne purge rien et
 * réessaiera à la prochaine occurrence.
 */
@Injectable()
export class EmailRetentionService {
  private readonly logger = new Logger(EmailRetentionService.name);
  /** Empêche deux exécutions concurrentes (cron + déclenchement manuel). */
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Rétention effective, bornée et repliée sur la valeur par défaut si illisible. */
  get retentionDays(): number {
    const raw = Number(
      this.config.get<string | number>('EMAIL_LOG_RETENTION_DAYS', DEFAULT_EMAIL_LOG_RETENTION_DAYS),
    );
    if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_EMAIL_LOG_RETENTION_DAYS;
    return Math.min(MAX_RETENTION_DAYS, Math.max(MIN_RETENTION_DAYS, Math.floor(raw)));
  }

  /** Exécution planifiée : chaque nuit à 3 h, heure du serveur. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'purge-email-logs' })
  async handleCron(): Promise<void> {
    await this.purge();
  }

  /**
   * Supprime les entrées `email_logs` antérieures à la fenêtre de rétention.
   * Ne lève jamais : renvoie le nombre de lignes supprimées (0 en cas d'échec).
   */
  async purge(): Promise<number> {
    if (this.running) {
      this.logger.warn('Purge email_logs déjà en cours — exécution ignorée.');
      return 0;
    }
    this.running = true;

    const days = this.retentionDays;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    let total = 0;

    try {
      // Suppression par lots : on borne chaque `deleteMany` à PURGE_BATCH_SIZE
      // identifiants pour ne pas verrouiller la table sur un premier passage
      // volumineux.
      for (;;) {
        const batch = await this.prisma.emailLog.findMany({
          where: { createdAt: { lt: cutoff } },
          select: { id: true },
          take: PURGE_BATCH_SIZE,
        });
        if (batch.length === 0) break;

        const { count } = await this.prisma.emailLog.deleteMany({
          where: { id: { in: batch.map((row) => row.id) } },
        });
        total += count;

        if (batch.length < PURGE_BATCH_SIZE) break;
      }

      if (total > 0) {
        this.logger.log(
          `Purge email_logs : ${total} entrée(s) supprimée(s) (antérieures au ${cutoff.toISOString()}, rétention ${days} j).`,
        );
      } else {
        this.logger.debug(
          `Purge email_logs : aucune entrée à supprimer (rétention ${days} j).`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Purge email_logs impossible (${(err as Error).message}) — nouvelle tentative à la prochaine planification.`,
      );
      // Volontairement absorbé : la rétention ne doit jamais casser l'API.
    } finally {
      this.running = false;
    }

    return total;
  }
}
