import type { ConnectionOptions, JobsOptions } from 'bullmq';

/** Nom de la file BullMQ dédiée aux emails transactionnels. */
export const EMAIL_QUEUE_NAME = 'email';

/** Nom du job unique de la file email. */
export const EMAIL_JOB_NAME = 'send';

/** Charge utile d'un job d'envoi d'email (sérialisée en JSON dans Redis). */
export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Étiquette de journalisation (ex. « bienvenue », « recu-don »). */
  tag: string;
  /** Organisation à l'origine de l'envoi, si connue (traçabilité EmailLog). */
  organisationId?: string;
  /** Horodatage de mise en file (diagnostic de latence). */
  enqueuedAt?: string;
}

/** Politique de réessai : 3 tentatives, backoff exponentiel à partir de 5 s. */
export const EMAIL_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  // On purge les succès (1 h / 500 max) mais on conserve les échecs pour diagnostic.
  removeOnComplete: { age: 3600, count: 500 },
  removeOnFail: { count: 1000 },
};

/**
 * Construit les options de connexion Redis à partir de `REDIS_URL`.
 * Renvoie `null` si la variable est absente ou illisible — dans ce cas
 * aucune file n'est créée et l'application retombe sur le mode dégradé.
 */
export function parseRedisUrl(rawUrl: string | undefined | null): ConnectionOptions | null {
  const url = (rawUrl ?? '').trim();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const db = parsed.pathname && parsed.pathname.length > 1 ? Number(parsed.pathname.slice(1)) : undefined;

    return {
      host: parsed.hostname || '127.0.0.1',
      port: Number(parsed.port) || 6379,
      ...(parsed.username ? { username: decodeURIComponent(parsed.username) } : {}),
      ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
      ...(Number.isFinite(db) ? { db } : {}),
      ...(parsed.protocol === 'rediss:' ? { tls: {} } : {}),
      // Obligatoire pour BullMQ (commandes bloquantes côté worker).
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      // Ne pas boucler indéfiniment sur un Redis mort : on plafonne le backoff.
      retryStrategy: (times: number) => Math.min(times * 1000, 30000),
    } as ConnectionOptions;
  } catch {
    return null;
  }
}
