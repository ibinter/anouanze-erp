import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import {
  buildEmailJobId,
  EMAIL_JOB_NAME,
  EMAIL_JOB_OPTIONS,
  EMAIL_QUEUE_NAME,
  EmailJobData,
  parseRedisUrl,
} from './queue.constants';

/** Délai maximal accordé à Redis pour accepter un job avant repli en mode dégradé. */
const ENQUEUE_TIMEOUT_MS = 2000;

/**
 * Délai accordé à la vérification post-timeout : après un `add()` non
 * acquitté, on demande à Redis si le job existe malgré tout. Court, car il
 * s'agit d'une simple lecture par clé.
 */
const CONFIRM_TIMEOUT_MS = 1000;

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
   * Met un email en file. Renvoie `true` si Redis détient le job,
   * `false` dans tous les autres cas (jamais d'exception).
   *
   * ## Déduplication
   *
   * Le job porte un `jobId` **déterministe** dérivé du destinataire, de
   * l'étiquette, du sujet et d'une fenêtre temporelle d'une minute
   * (`buildEmailJobId`). BullMQ refuse silencieusement un `add()` dont le
   * `jobId` existe déjà : deux demandes identiques rapprochées ne produisent
   * donc qu'un seul envoi.
   *
   * ## Accusé perdu
   *
   * Auparavant, si Redis acceptait le job mais que l'accusé dépassait
   * {@link ENQUEUE_TIMEOUT_MS}, on renvoyait `false` et l'appelant envoyait
   * l'email en direct : le destinataire le recevait **deux fois** (une par la
   * file, une par le repli mémoire). Le `jobId` étant maintenant prévisible,
   * on interroge Redis après le timeout : si le job est présent, on renvoie
   * `true` et aucun envoi direct n'a lieu.
   */
  async enqueue(data: EmailJobData): Promise<boolean> {
    if (!this.queue) return false;

    const jobId = buildEmailJobId(data);

    try {
      const added = await Promise.race([
        this.queue.add(
          EMAIL_JOB_NAME,
          { ...data, enqueuedAt: new Date().toISOString() },
          { ...EMAIL_JOB_OPTIONS, jobId },
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('délai de mise en file dépassé')), ENQUEUE_TIMEOUT_MS),
        ),
      ]);

      // `add()` avec un jobId déjà connu renvoie le job existant : rien n'est
      // dupliqué, on considère l'email comme pris en charge.
      this.logger.log(
        `[email:${data.tag}] mis en file (job ${added.id ?? jobId}) → ${data.to} — « ${data.subject} »`,
      );
      return true;
    } catch (err) {
      this.warnConnection(err as Error);

      // L'accusé s'est perdu : le job a-t-il tout de même été créé ?
      if (await this.jobExists(jobId)) {
        this.logger.warn(
          `[email:${data.tag}] accusé de mise en file perdu, mais le job ${jobId} existe dans Redis — pas d'envoi direct (anti-doublon).`,
        );
        return true;
      }

      this.logger.warn(
        `[email:${data.tag}] mise en file impossible (${(err as Error).message}) — bascule en envoi direct.`,
      );
      return false;
    }
  }

  /**
   * Le job existe-t-il dans Redis ? Utilisé uniquement pour lever le doute
   * après un accusé perdu. Toute erreur ou lenteur vaut « absent » : on
   * préfère un doublon improbable à un email jamais parti.
   */
  private async jobExists(jobId: string): Promise<boolean> {
    if (!this.queue) return false;
    try {
      const job = await Promise.race([
        this.queue.getJob(jobId),
        new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), CONFIRM_TIMEOUT_MS)),
      ]);
      return Boolean(job);
    } catch {
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
