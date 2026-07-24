import { Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { ConfigurationService } from '../configuration/configuration.service';

/**
 * Intégration réelle de l'agrégateur CinetPay (Orange Money, MTN MoMo, Moov,
 * Wave, cartes bancaires) — https://docs.cinetpay.com
 *
 * ⚠️ DÉGRADATION HONNÊTE (exigence cahier des charges IBIG SOFT) :
 * tant que `CINETPAY_API_KEY` et `CINETPAY_SITE_ID` ne sont pas renseignés,
 * `isConfigured()` renvoie `false`, AUCUN appel HTTP sortant n'est tenté et
 * l'interface doit continuer d'afficher « En intégration ».
 * Aucune clé n'est écrite en dur dans ce fichier, ni journalisée.
 *
 * 🔄 RECONFIGURATION À CHAUD : toutes les valeurs sont lues à la demande via
 * `ConfigurationService` (base d'abord, repli `process.env`). Rien n'est figé au
 * démarrage : dès que le SUPER_ADMIN saisit les clés dans l'interface, le
 * prochain appel les prend en compte (au plus après expiration du cache 30 s du
 * ConfigurationService) — sans redémarrage du conteneur.
 */

/** Canaux de paiement acceptés par l'API CinetPay v2. */
export type CinetPayCanal = 'ALL' | 'MOBILE_MONEY' | 'CREDIT_CARD' | 'WALLET';

/** Statut normalisé côté ERP (aligné sur la colonne `statut` de transactions_paiement). */
export type StatutTransaction = 'EN_ATTENTE' | 'SUCCES' | 'ECHEC' | 'ANNULE';

export interface CinetPayInitiationParams {
  /** Identifiant unique côté ERP — sert de `transaction_id` CinetPay. */
  transactionId: string;
  montant: number;
  devise: string;
  description: string;
  clientEmail?: string;
  clientTelephone?: string;
  clientNom?: string;
  clientPrenom?: string;
  canal?: CinetPayCanal;
  /** Métadonnée libre relayée telle quelle par CinetPay dans le webhook. */
  metadata?: string;
}

export interface CinetPayInitiationResult {
  ok: boolean;
  /** URL de la page de paiement CinetPay vers laquelle rediriger le payeur. */
  paymentUrl?: string;
  paymentToken?: string;
  code?: string;
  message?: string;
  /** Motif d'échec exploitable côté appelant (jamais `undefined` si `ok === false`). */
  erreur?: string;
}

export interface CinetPayCheckResult {
  ok: boolean;
  statut: StatutTransaction;
  code?: string;
  message?: string;
  montant?: number;
  devise?: string;
  methodePaiement?: string;
  operateurId?: string;
  datePaiement?: string;
  erreur?: string;
  brut?: Record<string, unknown>;
}

interface CinetPayApiResponse {
  code?: string;
  message?: string;
  description?: string;
  data?: Record<string, unknown>;
  api_response_id?: string;
}

/** Base officielle de l'API Checkout v2 (identique en TEST et PRODUCTION). */
const CINETPAY_BASE_URL = 'https://api-checkout.cinetpay.com/v2';

/** Devises dont le montant doit être un multiple de 5 (règle CinetPay). */
const DEVISES_MULTIPLE_5 = ['XOF', 'XAF', 'CDF', 'GNF'];

/** Devises acceptées par CinetPay. */
const DEVISES_SUPPORTEES = ['XOF', 'XAF', 'CDF', 'GNF', 'USD'];

/**
 * Ordre EXACT de concaténation des champs pour le calcul du HMAC-SHA256
 * du header `x-token` des notifications CinetPay. Ne pas réordonner.
 */
const CHAMPS_SIGNATURE_WEBHOOK = [
  'cpm_site_id',
  'cpm_trans_id',
  'cpm_trans_date',
  'cpm_amount',
  'cpm_currency',
  'signature',
  'payment_method',
  'cel_phone_num',
  'cpm_phone_prefixe',
  'cpm_language',
  'cpm_version',
  'cpm_payment_config',
  'cpm_page_action',
  'cpm_custom',
  'cpm_designation',
  'cpm_error_message',
] as const;

/** Instantané de configuration lu à la demande (jamais mis en cache ici). */
interface CinetPayConfiguration {
  apiKey: string;
  siteId: string;
  secretKey: string;
  mode: 'PRODUCTION' | 'TEST';
  notifyUrl: string;
  returnUrl: string;
  timeoutMs: number;
}

@Injectable()
export class CinetPayService {
  private readonly logger = new Logger(CinetPayService.name);

  constructor(private readonly config: ConfigurationService) {}

  // ---------------------------------------------------------------------
  // Configuration (lue à chaud, base puis process.env)
  // ---------------------------------------------------------------------

  private async lire(cle: string): Promise<string> {
    const valeur = await this.config.get(cle);
    return typeof valeur === 'string' ? valeur.trim() : '';
  }

  /**
   * Lit l'intégralité des paramètres CinetPay pour l'opération en cours.
   * Aucun état n'est conservé entre deux appels : la seule mémoïsation est le
   * cache court du `ConfigurationService`, ce qui permet la reconfiguration à
   * chaud depuis l'interface superadmin.
   */
  private async chargerConfiguration(): Promise<CinetPayConfiguration> {
    const [apiKey, siteId, secretKey, mode, notifyExplicite, apiUrl, returnExplicite, appUrl, timeoutBrut] =
      await Promise.all([
        this.lire('CINETPAY_API_KEY'),
        this.lire('CINETPAY_SITE_ID'),
        this.lire('CINETPAY_SECRET_KEY'),
        this.lire('CINETPAY_MODE'),
        this.lire('CINETPAY_NOTIFY_URL'),
        this.lire('API_URL'),
        this.lire('CINETPAY_RETURN_URL'),
        this.lire('APP_URL'),
        this.lire('CINETPAY_TIMEOUT_MS'),
      ]);

    const notifyUrl =
      notifyExplicite ||
      (apiUrl ? `${apiUrl.replace(/\/+$/, '')}/api/v1/paiements/webhook/cinetpay` : '');
    const returnUrl = returnExplicite || (appUrl ? `${appUrl.replace(/\/+$/, '')}/paiements` : '');

    const timeout = Number(timeoutBrut);

    return {
      apiKey,
      siteId,
      secretKey,
      mode: mode.toUpperCase() === 'TEST' ? 'TEST' : 'PRODUCTION',
      notifyUrl,
      returnUrl,
      timeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : 15000,
    };
  }

  /** Identifiants marchands ET URLs de rappel présents ? */
  private estConfiguree(cfg: CinetPayConfiguration): boolean {
    return Boolean(cfg.apiKey && cfg.siteId && cfg.notifyUrl && cfg.returnUrl);
  }

  /** `PRODUCTION` par défaut ; `TEST` bascule la journalisation en mode verbeux. */
  async getMode(): Promise<'PRODUCTION' | 'TEST'> {
    return (await this.chargerConfiguration()).mode;
  }

  /**
   * Vrai uniquement si les identifiants marchands ET les URLs de rappel sont
   * présents. Pilote l'affichage « Disponible » / « En intégration » côté web.
   *
   * Asynchrone : la lecture peut venir de la base (configuration superadmin).
   */
  async isConfigured(): Promise<boolean> {
    return this.estConfiguree(await this.chargerConfiguration());
  }

  /** Vrai si la vérification HMAC locale des webhooks est possible. */
  async peutVerifierSignature(): Promise<boolean> {
    return Boolean((await this.chargerConfiguration()).secretKey);
  }

  /** Diagnostic non sensible — ne renvoie jamais la moindre clé. */
  async getDiagnostic() {
    const cfg = await this.chargerConfiguration();
    return {
      configure: this.estConfiguree(cfg),
      mode: cfg.mode,
      apiKeyPresente: Boolean(cfg.apiKey),
      siteIdPresent: Boolean(cfg.siteId),
      secretKeyPresente: Boolean(cfg.secretKey),
      notifyUrlPresente: Boolean(cfg.notifyUrl),
      returnUrlPresente: Boolean(cfg.returnUrl),
      variablesManquantes: this.variablesManquantes(cfg),
    };
  }

  private variablesManquantes(cfg: CinetPayConfiguration): string[] {
    const manquantes: string[] = [];
    if (!cfg.apiKey) manquantes.push('CINETPAY_API_KEY');
    if (!cfg.siteId) manquantes.push('CINETPAY_SITE_ID');
    if (!cfg.notifyUrl) manquantes.push('CINETPAY_NOTIFY_URL');
    if (!cfg.returnUrl) manquantes.push('CINETPAY_RETURN_URL');
    return manquantes;
  }

  // ---------------------------------------------------------------------
  // Transport HTTP
  // ---------------------------------------------------------------------

  private async postJson(
    chemin: string,
    corps: Record<string, unknown>,
    cfg: CinetPayConfiguration,
  ): Promise<{ ok: boolean; body?: CinetPayApiResponse; erreur?: string }> {
    const url = `${CINETPAY_BASE_URL}${chemin}`;
    const controleur = new AbortController();
    const minuterie = setTimeout(() => controleur.abort(), cfg.timeoutMs);

    try {
      const reponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(corps),
        signal: controleur.signal,
      });

      const texte = await reponse.text();
      let body: CinetPayApiResponse;
      try {
        body = JSON.parse(texte) as CinetPayApiResponse;
      } catch {
        this.logger.error(`CinetPay ${chemin} : réponse non JSON (HTTP ${reponse.status})`);
        return { ok: false, erreur: `Réponse CinetPay illisible (HTTP ${reponse.status})` };
      }

      if (cfg.mode === 'TEST') {
        this.logger.debug(`CinetPay ${chemin} → HTTP ${reponse.status} code=${body?.code}`);
      }

      return { ok: true, body };
    } catch (erreur: unknown) {
      const estTimeout = erreur instanceof Error && erreur.name === 'AbortError';
      const message = estTimeout
        ? `Délai dépassé (${cfg.timeoutMs} ms) sur ${chemin}`
        : erreur instanceof Error
          ? erreur.message
          : 'Erreur réseau inconnue';
      this.logger.error(`CinetPay ${chemin} injoignable : ${message}`);
      return { ok: false, erreur: message };
    } finally {
      clearTimeout(minuterie);
    }
  }

  // ---------------------------------------------------------------------
  // Initiation d'un paiement — POST /v2/payment
  // ---------------------------------------------------------------------

  async initierPaiement(params: CinetPayInitiationParams): Promise<CinetPayInitiationResult> {
    const cfg = await this.chargerConfiguration();

    // Sans clés : aucun appel HTTP sortant n'est tenté.
    if (!this.estConfiguree(cfg)) {
      return {
        ok: false,
        erreur: `CinetPay non configuré (variables manquantes : ${this.variablesManquantes(cfg).join(', ')})`,
      };
    }

    const devise = (params.devise || 'XOF').toUpperCase();
    if (!DEVISES_SUPPORTEES.includes(devise)) {
      return { ok: false, erreur: `Devise ${devise} non supportée par CinetPay` };
    }

    let montant = Math.round(Number(params.montant));
    if (!Number.isFinite(montant) || montant <= 0) {
      return { ok: false, erreur: 'Montant invalide' };
    }
    if (DEVISES_MULTIPLE_5.includes(devise) && montant % 5 !== 0) {
      // Règle CinetPay : les montants en zone franc doivent être multiples de 5.
      montant = Math.ceil(montant / 5) * 5;
    }

    const charge: Record<string, unknown> = {
      apikey: cfg.apiKey,
      site_id: cfg.siteId,
      transaction_id: params.transactionId,
      amount: montant,
      currency: devise,
      description: (params.description || 'Paiement ANOUANZÊ').slice(0, 255),
      notify_url: cfg.notifyUrl,
      return_url: cfg.returnUrl,
      channels: params.canal ?? 'ALL',
      lang: 'fr',
    };

    if (params.clientNom) charge.customer_name = params.clientNom;
    if (params.clientPrenom) charge.customer_surname = params.clientPrenom;
    if (params.clientEmail) charge.customer_email = params.clientEmail;
    if (params.clientTelephone) charge.customer_phone_number = params.clientTelephone;
    if (params.metadata) charge.metadata = params.metadata.slice(0, 255);

    const resultat = await this.postJson('/payment', charge, cfg);
    if (!resultat.ok || !resultat.body) {
      return { ok: false, erreur: resultat.erreur ?? 'Appel CinetPay en échec' };
    }

    const body = resultat.body;
    const paymentUrl = body.data?.['payment_url'] as string | undefined;
    const paymentToken = body.data?.['payment_token'] as string | undefined;

    if (body.code !== '201' || !paymentUrl) {
      this.logger.warn(
        `CinetPay a refusé l'initiation ${params.transactionId} : code=${body.code} message=${body.message} description=${body.description}`,
      );
      return {
        ok: false,
        code: body.code,
        message: body.message,
        erreur: body.description || body.message || `CinetPay a répondu code=${body.code}`,
      };
    }

    this.logger.log(`CinetPay : paiement ${params.transactionId} initié (${montant} ${devise})`);
    return { ok: true, paymentUrl, paymentToken, code: body.code, message: body.message };
  }

  // ---------------------------------------------------------------------
  // Vérification du statut — POST /v2/payment/check
  // ---------------------------------------------------------------------

  async verifierTransaction(transactionId: string): Promise<CinetPayCheckResult> {
    const cfg = await this.chargerConfiguration();

    // Sans clés : aucun appel HTTP sortant n'est tenté.
    if (!this.estConfiguree(cfg)) {
      return { ok: false, statut: 'EN_ATTENTE', erreur: 'CinetPay non configuré' };
    }

    const resultat = await this.postJson(
      '/payment/check',
      {
        apikey: cfg.apiKey,
        site_id: cfg.siteId,
        transaction_id: transactionId,
      },
      cfg,
    );

    if (!resultat.ok || !resultat.body) {
      return { ok: false, statut: 'EN_ATTENTE', erreur: resultat.erreur ?? 'Appel CinetPay en échec' };
    }

    const body = resultat.body;
    const data = (body.data ?? {}) as Record<string, unknown>;

    return {
      ok: true,
      statut: this.normaliserStatut(body.code, data['status'] as string | undefined),
      code: body.code,
      message: body.message,
      montant: data['amount'] !== undefined ? Number(data['amount']) : undefined,
      devise: data['currency'] as string | undefined,
      methodePaiement: data['payment_method'] as string | undefined,
      operateurId: data['operator_id'] as string | undefined,
      datePaiement: data['payment_date'] as string | undefined,
      brut: { code: body.code, message: body.message, data },
    };
  }

  /**
   * Traduit la réponse CinetPay en statut ERP.
   * Prudence délibérée : tout état non explicitement final reste `EN_ATTENTE`
   * (jamais de succès supposé).
   */
  normaliserStatut(code?: string, status?: string): StatutTransaction {
    const etat = (status ?? '').toUpperCase();
    if (etat === 'ACCEPTED') return 'SUCCES';
    if (etat === 'REFUSED' || etat === 'PAYMENT_FAILED') return 'ECHEC';
    if (etat === 'CANCELED' || etat === 'CANCELLED') return 'ANNULE';
    if (etat === 'PENDING' || etat === 'WAITING_FOR_CUSTOMER') return 'EN_ATTENTE';

    switch (code) {
      case '00': // TRANSACTION trouvée et acceptée
        return 'SUCCES';
      case '600': // PAYMENT_FAILED
      case '602': // Solde insuffisant / paiement refusé
        return 'ECHEC';
      case '627': // TOKEN introuvable — transaction jamais aboutie
      case '662': // WAITING_FOR_CUSTOMER
      default:
        return 'EN_ATTENTE';
    }
  }

  // ---------------------------------------------------------------------
  // Webhook — vérification du HMAC `x-token`
  // ---------------------------------------------------------------------

  /**
   * Recalcule le HMAC-SHA256 de la notification et le compare au header
   * `x-token`, selon la documentation CinetPay.
   *
   * Renvoie `null` quand la vérification n'est PAS concluante par absence de
   * secret ou de header : l'appelant doit alors se rabattre sur un appel
   * `/v2/payment/check` (source de vérité) plutôt que de faire confiance au corps.
   */
  async verifierSignatureWebhook(
    payload: Record<string, unknown>,
    tokenRecu?: string,
  ): Promise<boolean | null> {
    if (!tokenRecu) return null;

    const { secretKey } = await this.chargerConfiguration();
    if (!secretKey) return null;

    const concatene = CHAMPS_SIGNATURE_WEBHOOK.map((champ) => {
      const valeur = payload[champ];
      return valeur === undefined || valeur === null ? '' : String(valeur);
    }).join('');

    const attendu = createHmac('sha256', secretKey).update(concatene).digest('hex');

    try {
      const a = Buffer.from(attendu, 'utf8');
      const b = Buffer.from(tokenRecu.trim(), 'utf8');
      if (a.length !== b.length) return false;
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
}
