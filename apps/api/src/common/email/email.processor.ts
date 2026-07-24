import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import {
  EMAIL_JOB_OPTIONS,
  EMAIL_QUEUE_NAME,
  EmailJobData,
  parseRedisUrl,
} from '../queue/queue.constants';
import { EmailService } from './email.service';

/** Nombre d'emails traités simultanément (SMTP mutualisé LWS : rester bas). */
const EMAIL_WORKER_CONCURRENCY = 2;

/**
 * Worker BullMQ de la file `email` : c'est ici que l'envoi SMTP réel a lieu.
 *
 * Dégradation sûre : si `REDIS_URL` est absent/invalide, aucun worker n'est
 * démarré et l'application fonctionne normalement (EmailService bascule sur
 * l'envoi direct). Si Redis tombe en cours de route, le worker se reconnecte
 * seul ; les erreurs de connexion sont journalisées, jamais propagées.
 */
@Injectable()
export class EmailProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailProcessor.name);
  private worker: Worker<EmailJobData> | null = null;
  private lastConnectionWarnAt = 0;

  constructor(
    private readonly config: ConfigService,
    private readonly email: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    const connection = parseRedisUrl(this.config.get<string>('REDIS_URL'));
    if (!connection) {
      this.logger.warn("REDIS_URL absent — worker email non démarré (mode dégradé).");
      return;
    }

    try {
      this.worker = new Worker<EmailJobData>(
        EMAIL_QUEUE_NAME,
        async (job: Job<EmailJobData>) => this.handle(job),
        { connection, concurrency: EMAIL_WORKER_CONCURRENCY },
      );

      this.worker.on('error', (err: Error) => this.warnConnection(err));

      this.worker.on('failed', (job: Job<EmailJobData> | undefined, err: Error) => {
        const data = job?.data;
        const attempts = job?.attemptsMade ?? 0;
        const max = (job?.opts?.attempts ?? EMAIL_JOB_OPTIONS.attempts) as number;

        if (attempts < max) {
          this.logger.warn(
            `[email:${data?.tag ?? '?'}] échec tentative ${attempts}/${max} vers ${data?.to ?? '?'} — ${err.message} — réessai programmé.`,
          );
          return;
        }

        this.logger.error(
          `[email:${data?.tag ?? '?'}] ÉCHEC DÉFINITIF après ${attempts} tentatives vers ${data?.to ?? '?'} — ${err.message} (job conservé dans la file « failed »).`,
        );
        if (data) void this.log(data, 'ECHEC', err.message);
      });

      this.worker.on('completed', (job: Job<EmailJobData>) => {
        this.logger.log(
          `[email:${job.data.tag}] traité avec succès (job ${job.id ?? 'n/a'}) → ${job.data.to}`,
        );
      });

      this.logger.log(
        `Worker BullMQ « ${EMAIL_QUEUE_NAME} » démarré (concurrence ${EMAIL_WORKER_CONCURRENCY}).`,
      );
    } catch (err) {
      this.worker = null;
      this.logger.error(
        `Impossible de démarrer le worker « ${EMAIL_QUEUE_NAME} » (${(err as Error).message}) — mode dégradé actif.`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.worker?.close();
    } catch {
      /* fermeture best-effort */
    }
  }

  /** Traitement d'un job : lève en cas d'échec pour déclencher le réessai BullMQ. */
  private async handle(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, html, text, tag } = job.data;

    if (!this.email.isConfigured()) {
      // SMTP non configuré : on n'échoue pas (sinon 3 réessais inutiles), on journalise.
      this.logger.warn(
        `[email:${tag}] SMTP non configuré — job ${job.id ?? 'n/a'} ignoré (destinataire ${to}, sujet « ${subject} »).`,
      );
      await this.log(job.data, 'IGNORE', 'smtp-non-configure');
      return;
    }

    await this.email.sendEmail({ to, subject, html, text, tag });
    await this.log(job.data, 'ENVOYE');
  }

  /** Persistance du résultat dans EmailLog — best effort, jamais bloquante. */
  private async log(data: EmailJobData, statut: string, erreur?: string): Promise<void> {
    try {
      await this.prisma.emailLog.create({
        data: {
          destinataire: data.to,
          sujet: data.subject,
          template: data.tag,
          statut,
          erreur: erreur ?? null,
          organisationId: data.organisationId ?? null,
        },
      });
    } catch (err) {
      this.logger.warn(`Journalisation EmailLog impossible : ${(err as Error).message}`);
    }
  }

  private warnConnection(err: Error): void {
    const now = Date.now();
    if (now - this.lastConnectionWarnAt < 60000) return;
    this.lastConnectionWarnAt = now;
    this.logger.warn(`Redis indisponible pour le worker « ${EMAIL_QUEUE_NAME} » : ${err.message}`);
  }
}
