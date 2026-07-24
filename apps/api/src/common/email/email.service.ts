import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { ConfigurationService } from '../../modules/configuration/configuration.service';
import { EmailQueueService } from '../queue/email-queue.service';
import {
  BrandOptions,
  RenderedEmail,
  templateAlerteBudget,
  templateBienvenue,
  templateConfirmationCotisation,
  templateConfirmationDemo,
  templateEssaiExpire,
  templateFinEssai,
  templateInvitation,
  templateNotificationGenerique,
  templateNouveauTicket,
  templateRappelCotisation,
  templateRecuDon,
  templateReinitMotDePasse,
  templateRelanceProspect,
  templateReponseTicket,
} from './email.templates';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Étiquette de journalisation (ex. « bienvenue », « recu-don ») */
  tag?: string;
}

/** Résultat d'un envoi « sûr » : ne lève jamais d'exception. */
export interface EmailDispatchResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
}

/** Instantané des paramètres SMTP lus via la configuration (base puis env). */
interface SmtpConfiguration {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  appUrl: string;
}

const FROM_PAR_DEFAUT = 'ANOUANZÊ ERP <no-reply@anouanze-erp.com>';
const APP_URL_PAR_DEFAUT = 'http://localhost:3000';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: Transporter | null = null;
  private from: string = FROM_PAR_DEFAUT;
  private appUrl: string = APP_URL_PAR_DEFAUT;
  private enabled = false;
  private readonly logger = new Logger(EmailService.name);

  /**
   * Empreinte des paramètres ayant servi à construire le transport courant.
   * Dès qu'elle change (nouveau SMTP saisi dans l'interface superadmin), le
   * transport est fermé puis reconstruit — sans redémarrage du conteneur.
   * ⚠️ Contient un condensat, jamais le mot de passe en clair.
   */
  private empreinteTransport: string | null = null;

  /** Fenêtre de relecture de la configuration (le ConfigurationService cache déjà 30 s). */
  private static readonly TTL_RELECTURE_MS = 30_000;
  private prochaineRelecture = 0;
  private relectureEnCours: Promise<void> | null = null;

  /** File d'attente en mémoire — repli quand Redis/BullMQ est indisponible. */
  private queue: Promise<unknown> = Promise.resolve();
  private queueLength = 0;

  constructor(
    private readonly config: ConfigurationService,
    private readonly queueService: EmailQueueService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Chargement initial avant toute prise de trafic : `appUrl` / `from` sont
    // disponibles dès le premier email.
    await this.rafraichirConfiguration(true);

    if (!this.enabled) {
      this.logger.warn(
        "SMTP non configuré (SMTP_HOST absent) — les emails seront journalisés puis ignorés. L'application fonctionne normalement.",
      );
      return;
    }
    // Vérification non bloquante : un SMTP injoignable ne doit pas empêcher le démarrage.
    this.transporter
      ?.verify()
      .then(() => this.logger.log('SMTP opérationnel'))
      .catch((err: unknown) =>
        this.logger.warn(
          `SMTP injoignable au démarrage (${(err as Error).message}) — les envois seront tentés puis journalisés en cas d'échec.`,
        ),
      );
  }

  // ------------------------------------------------------------
  // Configuration à chaud
  // ------------------------------------------------------------

  /** Lecture des paramètres SMTP : base d'abord, repli `process.env`. */
  private async lireConfiguration(): Promise<SmtpConfiguration> {
    const texte = async (cle: string): Promise<string> => {
      const valeur = await this.config.get(cle);
      return typeof valeur === 'string' ? valeur.trim() : '';
    };

    const [host, user, pass, portBrut, secureBrut, from, appUrl] = await Promise.all([
      texte('SMTP_HOST'),
      texte('SMTP_USER'),
      texte('SMTP_PASSWORD'),
      texte('SMTP_PORT'),
      texte('SMTP_SECURE'),
      texte('EMAIL_FROM'),
      texte('APP_URL'),
    ]);

    const port = Number(portBrut) || 587;

    return {
      host,
      port,
      secure: secureBrut.toLowerCase() === 'true' || port === 465,
      user,
      pass,
      from: from || FROM_PAR_DEFAUT,
      appUrl: (appUrl || APP_URL_PAR_DEFAUT).replace(/\/$/, ''),
    };
  }

  /**
   * Relit la configuration et reconstruit le transport si les paramètres ont
   * bougé. Ne lève jamais : en cas d'erreur, l'état courant est conservé.
   */
  private async rafraichirConfiguration(force = false): Promise<void> {
    if (!force && Date.now() < this.prochaineRelecture) return;
    if (this.relectureEnCours) return this.relectureEnCours;

    this.relectureEnCours = (async () => {
      try {
        const cfg = await this.lireConfiguration();

        this.from = cfg.from;
        this.appUrl = cfg.appUrl;
        this.enabled = cfg.host.length > 0;

        // Empreinte sans secret en clair : la longueur du mot de passe suffit
        // à détecter un changement.
        const empreinte = this.enabled
          ? `${cfg.host}|${cfg.port}|${cfg.secure}|${cfg.user}|${cfg.pass.length}`
          : null;

        if (empreinte !== this.empreinteTransport) {
          this.fermerTransport();
          this.empreinteTransport = empreinte;

          if (this.enabled) {
            this.transporter = nodemailer.createTransport({
              host: cfg.host,
              port: cfg.port,
              secure: cfg.secure,
              // Auth optionnelle : les relais locaux (MailHog, Postfix) n'en ont pas.
              ...(cfg.user ? { auth: { user: cfg.user, pass: cfg.pass } } : {}),
              tls: { rejectUnauthorized: false },
            });
            this.logger.log('Transport SMTP (re)construit depuis la configuration.');
          }
        }
      } catch (err) {
        this.logger.warn(
          `Lecture de la configuration SMTP impossible (${(err as Error).message}) — paramètres précédents conservés.`,
        );
      } finally {
        this.prochaineRelecture = Date.now() + EmailService.TTL_RELECTURE_MS;
        this.relectureEnCours = null;
      }
    })();

    return this.relectureEnCours;
  }

  private fermerTransport(): void {
    try {
      (this.transporter as unknown as { close?: () => void } | null)?.close?.();
    } catch {
      // Fermeture best effort — ne doit jamais interrompre quoi que ce soit.
    }
    this.transporter = null;
  }

  /**
   * Le service dispose-t-il d'un relais SMTP configuré ?
   * Synchrone (compatibilité des appelants) : renvoie le dernier état connu,
   * rafraîchi au plus toutes les 30 s et systématiquement avant chaque
   * `dispatch()` / `sendEmail()`.
   */
  isConfigured(): boolean {
    void this.rafraichirConfiguration();
    return this.enabled;
  }

  /**
   * Nombre d'emails en attente dans la file en mémoire (repli uniquement).
   * En fonctionnement nominal la file durable est dans Redis :
   * voir `EmailQueueService.getCounts()`.
   */
  getQueueLength(): number {
    return this.queueLength;
  }

  private brand(overrides?: BrandOptions): BrandOptions {
    return { appUrl: this.appUrl, ...(overrides ?? {}) };
  }

  private url(path: string): string {
    return `${this.appUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  // ------------------------------------------------------------
  // Envoi bas niveau
  // ------------------------------------------------------------

  /**
   * Envoi direct. Lève une exception en cas d'échec — réservé aux appels
   * qui doivent connaître le résultat (envoi de masse, tests de configuration).
   * Pour tout envoi transactionnel, préférer `dispatch()`.
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    // Relit la configuration : un SMTP saisi entre-temps est pris en compte.
    await this.rafraichirConfiguration();

    if (!this.enabled || !this.transporter) {
      this.logger.warn(
        `[email:${options.tag ?? 'brut'}] SMTP non configuré — envoi ignoré (destinataire ${options.to}, sujet « ${options.subject} »)`,
      );
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(
        `[email:${options.tag ?? 'brut'}] envoyé à ${options.to} — « ${options.subject} » (id ${(info as { messageId?: string })?.messageId ?? 'n/a'})`,
      );
    } catch (err) {
      this.logger.error(
        `[email:${options.tag ?? 'brut'}] échec envoi à ${options.to} — ${(err as Error).message}`,
      );
      throw new InternalServerErrorException(`Échec envoi email : ${(err as Error).message}`);
    }
  }

  /**
   * Envoi « sûr », asynchrone et journalisé : ne lève JAMAIS d'exception et
   * ne bloque pas l'action métier appelante.
   *
   * Chemin nominal : le message est poussé dans la file BullMQ `email`
   * (durable, persistée dans Redis, 3 tentatives avec backoff exponentiel).
   * `dispatch()` rend la main dès la mise en file — l'envoi SMTP réel est
   * effectué par {@link EmailProcessor}.
   *
   * Chemin dégradé : si Redis est absent ou injoignable, on retombe sur la
   * file en mémoire historique (envoi direct sérialisé, best effort). Aucune
   * action métier ne doit jamais échouer à cause d'un email.
   */
  async dispatch(
    to: string | undefined | null,
    mail: RenderedEmail,
    tag: string,
  ): Promise<EmailDispatchResult> {
    if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      this.logger.warn(`[email:${tag}] destinataire absent ou invalide — envoi ignoré`);
      return { ok: false, skipped: true, reason: 'destinataire-invalide' };
    }

    // Relecture à chaud (ne lève jamais) : dès que le SMTP est renseigné dans
    // l'interface, l'envoi suivant part sans redémarrage.
    await this.rafraichirConfiguration();

    if (!this.enabled) {
      this.logger.warn(
        `[email:${tag}] SMTP non configuré — email « ${mail.subject} » destiné à ${to} non envoyé (journalisé uniquement)`,
      );
      return { ok: false, skipped: true, reason: 'smtp-non-configure' };
    }

    // 1) File durable BullMQ (ne lève jamais : renvoie false si indisponible).
    const queued = await this.queueService.enqueue({
      to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      tag,
    });

    if (queued) {
      return { ok: true, reason: 'mis-en-file' };
    }

    // 2) Repli : file en mémoire (perdue au redémarrage, mais l'email part).
    if (this.queueService.isEnabled()) {
      this.logger.warn(
        `[email:${tag}] Redis indisponible — repli sur la file en mémoire pour ${to}.`,
      );
    }
    return this.dispatchInMemory(to, mail, tag);
  }

  /** File en mémoire historique — utilisée uniquement en repli. */
  private dispatchInMemory(
    to: string,
    mail: RenderedEmail,
    tag: string,
  ): Promise<EmailDispatchResult> {
    this.queueLength += 1;
    const task = this.queue.then(async (): Promise<EmailDispatchResult> => {
      try {
        await this.sendEmail({ to, subject: mail.subject, html: mail.html, text: mail.text, tag });
        return { ok: true };
      } catch (err) {
        // Déjà journalisé dans sendEmail — on absorbe pour ne rien casser en amont.
        return { ok: false, reason: (err as Error).message };
      } finally {
        this.queueLength -= 1;
      }
    });

    // La file continue même si une tâche échoue.
    this.queue = task.catch(() => undefined);
    return task;
  }

  // ------------------------------------------------------------
  // Cycle de vie du compte
  // ------------------------------------------------------------

  /** Bienvenue après inscription / création de compte. */
  async sendWelcome(
    to: string,
    nom: string,
    organisationNom?: string,
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    return this.dispatch(
      to,
      templateBienvenue({
        nom,
        organisationNom,
        loginUrl: this.url('/login'),
        brand: this.brand(brand),
      }),
      'bienvenue',
    );
  }

  /** Invitation d'un utilisateur à rejoindre une organisation. */
  async sendInvitation(
    to: string,
    params: {
      nomInvite?: string;
      invitePar: string;
      organisationNom: string;
      role?: string;
      token?: string;
      inviteUrl?: string;
      expireLe?: Date | string;
    },
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    const inviteUrl =
      params.inviteUrl ??
      this.url(`/invitation?token=${encodeURIComponent(params.token ?? '')}&email=${encodeURIComponent(to)}`);

    return this.dispatch(
      to,
      templateInvitation({ ...params, inviteUrl, brand: this.brand(brand) }),
      'invitation',
    );
  }

  /** Réinitialisation de mot de passe (le lien est fourni par AuthService). */
  async sendPasswordReset(
    to: string,
    nom: string,
    resetUrl: string,
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    return this.dispatch(
      to,
      templateReinitMotDePasse({ nom, resetUrl, dureeValiditeMinutes: 60, brand: this.brand(brand) }),
      'reinit-mot-de-passe',
    );
  }

  // ------------------------------------------------------------
  // Cycle commercial (prospects)
  // ------------------------------------------------------------

  /** Confirmation d'une demande de démonstration. */
  async sendConfirmationDemo(
    to: string,
    params: { nomContact: string; organisationNom?: string; dateSouhaitee?: Date | string },
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    return this.dispatch(
      to,
      templateConfirmationDemo({ ...params, brand: this.brand(brand) }),
      'demande-demo',
    );
  }

  /** Relance commerciale prospect (J+3 puis J+7). */
  async sendRelanceProspect(
    to: string,
    params: { nomContact: string; organisationNom?: string; jours: number },
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    return this.dispatch(
      to,
      templateRelanceProspect({
        ...params,
        demoUrl: this.url('/demo'),
        brand: this.brand(brand),
      }),
      `relance-prospect-j${params.jours}`,
    );
  }

  // ------------------------------------------------------------
  // Cycle d'essai / abonnement
  // ------------------------------------------------------------

  /** Fin d'essai approchante (J-7, J-1). */
  async sendFinEssaiProche(
    to: string,
    params: { nom: string; organisationNom: string; joursRestants: number; dateFin?: Date | string },
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    return this.dispatch(
      to,
      templateFinEssai({
        ...params,
        abonnementUrl: this.url('/parametres/abonnement'),
        brand: this.brand(brand),
      }),
      `fin-essai-j${params.joursRestants}`,
    );
  }

  /** Essai expiré. */
  async sendEssaiExpire(
    to: string,
    params: { nom: string; organisationNom: string },
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    return this.dispatch(
      to,
      templateEssaiExpire({
        ...params,
        abonnementUrl: this.url('/parametres/abonnement'),
        brand: this.brand(brand),
      }),
      'essai-expire',
    );
  }

  // ------------------------------------------------------------
  // Dons & cotisations
  // ------------------------------------------------------------

  /**
   * Reçu de don. Signature historique conservée (donateur / don) pour ne pas
   * casser les appelants existants.
   */
  async sendRecuDon(
    to: string,
    donateur: { nom: string; prenom?: string },
    don: { montant?: number | null; dateDon: Date | string; numeroRecu?: string; type: string },
    organisationNom?: string,
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    const donateurNom = [donateur.prenom, donateur.nom].filter(Boolean).join(' ') || 'Donateur';
    return this.dispatch(
      to,
      templateRecuDon({
        donateurNom,
        montant: don.montant,
        dateDon: don.dateDon,
        numeroRecu: don.numeroRecu,
        typeDon: don.type,
        organisationNom,
        brand: this.brand(brand),
      }),
      'recu-don',
    );
  }

  /** Confirmation d'une cotisation réglée. */
  async sendConfirmationCotisation(
    to: string,
    params: {
      nom: string;
      montant: number;
      devise?: string;
      periode?: string;
      datePaiement: Date | string;
      reference?: string;
      organisationNom?: string;
    },
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    return this.dispatch(
      to,
      templateConfirmationCotisation({ ...params, brand: this.brand(brand) }),
      'confirmation-cotisation',
    );
  }

  /**
   * Rappel de cotisation. Signature historique conservée
   * (to, nom, montant, echeance) + paramètres optionnels.
   */
  async sendCotisationReminder(
    to: string,
    nom: string,
    montant: number,
    echeance: Date | string,
    options?: { joursRetard?: number; devise?: string; organisationNom?: string },
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    return this.dispatch(
      to,
      templateRappelCotisation({
        nom,
        montant,
        echeance,
        joursRetard: options?.joursRetard,
        devise: options?.devise,
        organisationNom: options?.organisationNom,
        paiementUrl: this.url('/cotisations'),
        brand: this.brand(brand),
      }),
      'rappel-cotisation',
    );
  }

  /** Alerte budgétaire (seuil atteint ou enveloppe dépassée). */
  async sendAlerteBudget(
    to: string,
    params: {
      nom: string;
      budgetNom: string;
      pourcentageConsomme: number;
      montantConsomme?: number;
      montantTotal?: number;
      devise?: string;
      budgetId?: string;
    },
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    return this.dispatch(
      to,
      templateAlerteBudget({
        ...params,
        budgetUrl: this.url(params.budgetId ? `/budget?id=${params.budgetId}` : '/budget'),
        brand: this.brand(brand),
      }),
      'alerte-budget',
    );
  }

  // ------------------------------------------------------------
  // Support
  // ------------------------------------------------------------

  /** Accusé de réception d'un nouveau ticket support. */
  async sendNouveauTicket(
    to: string,
    params: {
      nom: string;
      reference: string;
      sujet: string;
      priorite?: string;
      categorie?: string;
      ticketId?: string;
    },
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    return this.dispatch(
      to,
      templateNouveauTicket({
        ...params,
        ticketUrl: this.url(params.ticketId ? `/support/${params.ticketId}` : '/support'),
        brand: this.brand(brand),
      }),
      'ticket-nouveau',
    );
  }

  /** Notification d'une réponse apportée à un ticket. */
  async sendReponseTicket(
    to: string,
    params: {
      nom: string;
      reference: string;
      sujet: string;
      auteur?: string;
      message: string;
      statut?: string;
      ticketId?: string;
    },
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    return this.dispatch(
      to,
      templateReponseTicket({
        ...params,
        ticketUrl: this.url(params.ticketId ? `/support/${params.ticketId}` : '/support'),
        brand: this.brand(brand),
      }),
      'ticket-reponse',
    );
  }

  // ------------------------------------------------------------
  // Générique (relais des notifications internes)
  // ------------------------------------------------------------

  async sendNotificationGenerique(
    to: string,
    params: { nom?: string; titre: string; message: string; lien?: string },
    brand?: BrandOptions,
  ): Promise<EmailDispatchResult> {
    return this.dispatch(
      to,
      templateNotificationGenerique({
        nom: params.nom,
        titre: params.titre,
        message: params.message,
        lienUrl: params.lien ? this.url(params.lien) : undefined,
        brand: this.brand(brand),
      }),
      'notification',
    );
  }
}
