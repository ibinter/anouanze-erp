import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import {
  EMAIL_JOB_NAME,
  EMAIL_JOB_OPTIONS,
  EMAIL_QUEUE_NAME,
  EmailJobData,
  parseRedisUrl,
} from './queue.constants';

/** Délai maximal accordé à Redis pour accepter un job avant repli en mode dégradé. */
const ENQUEUE_TIMEOUT_MS = 2000;

/**
 * Producteur de la file `email`.
 *
 * Garantie forte : ce service n'échoue JAMAIS. Si `REDIS_URL` est absent, si
 * Redis est injoignable ou si la mise en file dépasse {@link ENQUEUE_TIMEOUT_MS},
 * `enqueue()` renvoie simplement `false` et l'appelant (EmailService) bascule
 * sur son mode dégradé (envoi direct best-effort puis journalisation).
 */
@Injectable()
export class EmailQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailQueueService.name);
  private queue: Queue<EmailJobData> | null = null;
  /** Journalisation anti-spam des erreurs de connexion Redis. */
  private lastConnectionWarnAt = 0;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const connection = parseRedisUrl(this.config.get<string>('REDIS_URL'));

    if (!connection) {
      this.logger.warn(
        "REDIS_URL absent ou invalide — file d'emails désactivée, les envois seront traités en direct puis journalisés (mode dégradé).",
      );
      return;
    }

    try {
      this.queue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
        connection,
        defaultJobOptions: EMAIL_JOB_OPTIONS,
      });

      // Une erreur de connexion ne doit jamais remonter en exception non capturée.
      this.queue.on('error', (err: Error) => this.warnConnection(err));

      this.logger.log(`File BullMQ « ${EMAIL_QUEUE_NAME} » initialisée (Redis configuré).`);
    } catch (err) {
      this.queue = null;
      this.logger.error(
        `Impossible d'initialiser la file « ${EMAIL_QUEUE_NAME} » (${(err as Error).message}) — mode dégradé actif.`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.queue?.close();
    } catch {
      /* fermeture best-effort */
    }
  }

  /** La file est-elle instanciée (Redis configuré) ? */
  isEnabled(): boolean {
    return this.queue !== null;
  }

  /**
   * Met un email en file. Renvoie `true` si Redis a accepté le job,
   * `false` dans tous les autres cas (jamais d'exception).
   */
  async enqueue(data: EmailJobData): Promise<boolean> {
    if (!this.queue) return false;

    try {
      const added = await Promise.race([
        this.queue.add(EMAIL_JOB_NAME, { ...data, enqueuedAt: new Date().toISOString() }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('délai de mise en file dépassé')), ENQUEUE_TIMEOUT_MS),
        ),
      ]);

      this.logger.log(
        `[email:${data.tag}] mis en file (job ${added.id ?? 'n/a'}) → ${data.to} — « ${data.subject} »`,
      );
      return true;
    } catch (err) {
      this.warnConnection(err as Error);
      this.logger.warn(
        `[email:${data.tag}] mise en file impossible (${(err as Error).message}) — bascule en envoi direct.`,
      );
      return false;
    }
  }

  /** Compteurs de la file, pour les sondes de supervision. */
  async getCounts(): Promise<Record<string, number> | null> {
    if (!this.queue) return null;
    try {
      return await this.queue.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed');
    } catch {
      return null;
    }
  }

  private warnConnection(err: Error): void {
    const now = Date.now();
    if (now - this.lastConnectionWarnAt < 60000) return;
    this.lastConnectionWarnAt = now;
    this.logger.warn(`Redis indisponible pour la file « ${EMAIL_QUEUE_NAME} » : ${err.message}`);
  }
}
