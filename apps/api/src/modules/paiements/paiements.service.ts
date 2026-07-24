import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InitierPaiementDto, OperateurPaiement } from './dto/initier-paiement.dto';
import { CinetPayService, CinetPayCanal, StatutTransaction } from './cinetpay.service';
import { v4 as uuidv4 } from 'uuid';

interface TransactionRow {
  id: string;
  organisation_id: string;
  montant: number;
  devise: string;
  description: string;
  payeur_email: string;
  payeur_tel: string;
  projet_id: string | null;
  donateur_id: string | null;
  type: string;
  statut: string;
  reference: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

/** Statuts au-delà desquels un webhook rejoué ne doit plus rien modifier. */
const STATUTS_TERMINAUX = ['SUCCES', 'ANNULE'];

/** Correspondance opérateur choisi → canal CinetPay. */
const CANAL_PAR_OPERATEUR: Record<OperateurPaiement, CinetPayCanal> = {
  [OperateurPaiement.ORANGE_MONEY]: 'MOBILE_MONEY',
  [OperateurPaiement.MTN_MOMO]: 'MOBILE_MONEY',
  [OperateurPaiement.MOOV_MONEY]: 'MOBILE_MONEY',
  [OperateurPaiement.WAVE]: 'MOBILE_MONEY',
  [OperateurPaiement.CARTE_BANCAIRE]: 'CREDIT_CARD',
  [OperateurPaiement.CINETPAY]: 'ALL',
};

/**
 * Opérateurs présentés dans l'interface. `viaCinetpay` marque ceux réellement
 * couverts par l'agrégateur une fois les clés renseignées.
 */
const CATALOGUE_OPERATEURS = [
  { id: 'ORANGE_MONEY', label: 'Orange Money', viaCinetpay: true },
  { id: 'MTN_MOMO', label: 'MTN MoMo', viaCinetpay: true },
  { id: 'MOOV_MONEY', label: 'Moov Money', viaCinetpay: true },
  { id: 'WAVE', label: 'Wave', viaCinetpay: true },
  { id: 'CINETPAY', label: 'CinetPay', viaCinetpay: true },
];

@Injectable()
export class PaiementsService {
  private readonly logger = new Logger(PaiementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cinetpay: CinetPayService,
  ) {}

  private async ensureTable() {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS transactions_paiement (
        id TEXT PRIMARY KEY,
        organisation_id TEXT NOT NULL,
        montant NUMERIC(15,2) NOT NULL,
        devise TEXT NOT NULL DEFAULT 'XOF',
        description TEXT,
        payeur_email TEXT,
        payeur_tel TEXT,
        projet_id TEXT,
        donateur_id TEXT,
        type TEXT NOT NULL,
        statut TEXT NOT NULL DEFAULT 'EN_ATTENTE',
        reference TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
  }

  // =====================================================================
  // Statut d'intégration des passerelles — pilote l'affichage honnête
  // =====================================================================

  /**
   * ⚠️ Contrainte cahier des charges IBIG SOFT : un opérateur n'est annoncé
   * « DISPONIBLE » que si les clés CinetPay sont effectivement présentes.
   * Sans clés, on retombe sur l'état antérieur (« En intégration » /
   * « Bientôt disponible ») — jamais de promesse mensongère.
   */
  getConfigurationPasserelles() {
    const configure = this.cinetpay.isConfigured();

    return {
      cinetpay: {
        configure,
        mode: configure ? this.cinetpay.getMode() : null,
        signatureVerifiable: this.cinetpay.peutVerifierSignature(),
      },
      /** Initiation réellement opérationnelle de bout en bout ? */
      initiationOperationnelle: configure,
      operateurs: CATALOGUE_OPERATEURS.map((op) => ({
        id: op.id,
        label: op.label,
        integration: configure && op.viaCinetpay ? 'DISPONIBLE' : op.viaCinetpay ? 'INTEGRATION' : 'BIENTOT',
        via: configure && op.viaCinetpay ? 'CINETPAY' : null,
      })),
    };
  }

  /** Diagnostic administrateur : quelles variables d'environnement manquent. */
  getDiagnosticPasserelles() {
    return { cinetpay: this.cinetpay.getDiagnostic() };
  }

  // =====================================================================
  // Initiation
  // =====================================================================

  async initierPaiement(orgId: string, dto: InitierPaiementDto) {
    await this.ensureTable();
    const id = uuidv4();
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO transactions_paiement
        (id, organisation_id, montant, devise, description, payeur_email, payeur_tel, projet_id, donateur_id, type, statut, reference, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'EN_ATTENTE', $11, $12::jsonb)`,
      id,
      orgId,
      dto.montant,
      dto.devise,
      dto.description,
      dto.payeurEmail,
      dto.payeurTel,
      dto.projetId ?? null,
      dto.donateurId ?? null,
      dto.type,
      reference,
      JSON.stringify({ operateurSouhaite: dto.operateur ?? null }),
    );

    const base = {
      id,
      reference,
      statut: 'EN_ATTENTE' as const,
      montant: dto.montant,
      devise: dto.devise,
    };

    // Dégradation honnête : sans clés, on conserve exactement l'ancien
    // comportement (simple enregistrement EN_ATTENTE, aucun appel sortant).
    if (!this.cinetpay.isConfigured()) {
      return {
        ...base,
        passerelle: null,
        paymentUrl: null,
        motif: 'PASSERELLE_NON_CONFIGUREE',
      };
    }

    const canal = dto.operateur ? CANAL_PAR_OPERATEUR[dto.operateur] : 'ALL';

    const resultat = await this.cinetpay.initierPaiement({
      transactionId: reference,
      montant: dto.montant,
      devise: dto.devise,
      description: dto.description,
      clientEmail: dto.payeurEmail,
      clientTelephone: dto.payeurTel,
      canal,
      metadata: id,
    });

    if (!resultat.ok) {
      await this.majMetadata(id, {
        cinetpay: { initiation: 'ECHEC', erreur: resultat.erreur, code: resultat.code ?? null },
      });
      this.logger.warn(`Initiation CinetPay échouée pour ${reference} : ${resultat.erreur}`);
      return {
        ...base,
        passerelle: 'CINETPAY',
        paymentUrl: null,
        motif: 'INITIATION_PASSERELLE_ECHOUEE',
        erreur: resultat.erreur,
      };
    }

    await this.majMetadata(id, {
      cinetpay: {
        initiation: 'OK',
        paymentUrl: resultat.paymentUrl,
        paymentToken: resultat.paymentToken ?? null,
        mode: this.cinetpay.getMode(),
        canal,
      },
    });

    return {
      ...base,
      passerelle: 'CINETPAY',
      paymentUrl: resultat.paymentUrl,
      paymentToken: resultat.paymentToken ?? null,
    };
  }

  // =====================================================================
  // Consultation / synchronisation de statut
  // =====================================================================

  async verifierStatut(transactionId: string) {
    await this.ensureTable();
    const transaction = await this.chargerParId(transactionId);
    if (!transaction) throw new NotFoundException(`Transaction ${transactionId} introuvable`);

    // Rattrapage : si le webhook n'est jamais arrivé, on interroge CinetPay
    // (source de vérité) pour les transactions encore en attente.
    if (
      transaction.statut === 'EN_ATTENTE' &&
      this.cinetpay.isConfigured() &&
      transaction.reference
    ) {
      const check = await this.cinetpay.verifierTransaction(transaction.reference);
      if (check.ok && check.statut !== 'EN_ATTENTE') {
        await this.appliquerStatut(transaction, check.statut, {
          cinetpay: { source: 'CHECK_API', ...check.brut },
        });
        return { ...transaction, statut: check.statut };
      }
    }

    return transaction;
  }

  // =====================================================================
  // Webhooks entrants
  // =====================================================================

  /**
   * Notification CinetPay.
   *
   * Chaîne de confiance :
   *  1. si `CINETPAY_SECRET_KEY` est présent → vérification HMAC du header `x-token` ;
   *  2. si les clés API sont présentes → re-vérification via `/v2/payment/check`
   *     (source de vérité, le corps du POST n'est jamais cru sur parole) ;
   *  3. sinon → comportement historique conservé (lecture de `payment_status`).
   *
   * Idempotent : une transaction déjà en statut terminal n'est jamais réappliquée.
   */
  async webhookCinetpay(payload: Record<string, unknown>, token?: string) {
    await this.ensureTable();

    const identifiants = [
      payload['cpm_trans_id'],
      payload['transaction_id'],
    ].filter((v): v is string => typeof v === 'string' && v.length > 0);

    if (!identifiants.length) {
      this.logger.warn('Webhook CinetPay reçu sans identifiant de transaction');
      return { received: true, traite: false, motif: 'IDENTIFIANT_ABSENT' };
    }

    const transaction = await this.resoudreTransaction(identifiants);
    if (!transaction) {
      this.logger.warn(`Webhook CinetPay : transaction ${identifiants[0]} inconnue`);
      return { received: true, traite: false, motif: 'TRANSACTION_INCONNUE' };
    }

    // 1 — Signature HMAC (si le secret est configuré).
    const signature = this.cinetpay.verifierSignatureWebhook(payload, token);
    if (signature === false) {
      this.logger.error(`Webhook CinetPay : signature invalide pour ${transaction.reference}`);
      return { received: true, traite: false, motif: 'SIGNATURE_INVALIDE' };
    }

    // 2 — Idempotence : statut terminal déjà appliqué.
    if (STATUTS_TERMINAUX.includes(transaction.statut)) {
      return { received: true, traite: false, motif: 'DEJA_TRAITE', statut: transaction.statut };
    }

    // 3 — Détermination du statut.
    let statut: StatutTransaction;
    let details: Record<string, unknown>;

    if (this.cinetpay.isConfigured() && transaction.reference) {
      const check = await this.cinetpay.verifierTransaction(transaction.reference);
      if (!check.ok) {
        this.logger.warn(
          `Webhook CinetPay : /payment/check indisponible pour ${transaction.reference} (${check.erreur}) — statut inchangé`,
        );
        return { received: true, traite: false, motif: 'VERIFICATION_INDISPONIBLE' };
      }
      statut = check.statut;
      details = {
        cinetpay: {
          source: 'WEBHOOK_VERIFIE',
          signatureVerifiee: signature === true,
          notification: payload,
          verification: check.brut,
        },
      };
    } else {
      // Comportement historique préservé (aucune clé configurée).
      statut = payload['payment_status'] === 'ACCEPTED' ? 'SUCCES' : 'ECHEC';
      details = { cinetpay: { source: 'WEBHOOK_NON_VERIFIE', notification: payload } };
    }

    if (statut === 'EN_ATTENTE') {
      await this.majMetadata(transaction.id, details);
      return { received: true, traite: false, motif: 'EN_ATTENTE', statut: 'EN_ATTENTE' };
    }

    await this.appliquerStatut(transaction, statut, details);
    this.logger.log(`Webhook CinetPay : ${transaction.reference} → ${statut}`);
    return { received: true, traite: true, statut };
  }

  /** Webhook Orange Money direct (inchangé, avec idempotence ajoutée). */
  async webhookOrangeMoney(payload: Record<string, unknown>) {
    await this.ensureTable();
    const identifiant = payload['txnid'];
    if (typeof identifiant !== 'string' || !identifiant) {
      return { received: true, traite: false, motif: 'IDENTIFIANT_ABSENT' };
    }

    const transaction = await this.resoudreTransaction([identifiant]);
    if (!transaction) {
      return { received: true, traite: false, motif: 'TRANSACTION_INCONNUE' };
    }
    if (STATUTS_TERMINAUX.includes(transaction.statut)) {
      return { received: true, traite: false, motif: 'DEJA_TRAITE', statut: transaction.statut };
    }

    const statut: StatutTransaction = payload['status'] === 'SUCCESS' ? 'SUCCES' : 'ECHEC';
    await this.appliquerStatut(transaction, statut, {
      orangeMoney: { notification: payload },
    });
    return { received: true, traite: true, statut };
  }

  // =====================================================================
  // Accès base
  // =====================================================================

  private async chargerParId(id: string): Promise<TransactionRow | null> {
    const rows = await this.prisma.$queryRawUnsafe<TransactionRow[]>(
      `SELECT * FROM transactions_paiement WHERE id = $1 LIMIT 1`,
      id,
    );
    return rows[0] ?? null;
  }

  /** Retrouve une transaction par son `id` interne OU sa `reference` passerelle. */
  private async resoudreTransaction(candidats: string[]): Promise<TransactionRow | null> {
    for (const candidat of candidats) {
      const rows = await this.prisma.$queryRawUnsafe<TransactionRow[]>(
        `SELECT * FROM transactions_paiement WHERE id = $1 OR reference = $1 LIMIT 1`,
        candidat,
      );
      if (rows[0]) return rows[0];
    }
    return null;
  }

  /** Fusionne (sans écraser) des informations dans la colonne `metadata`. */
  private async majMetadata(id: string, ajout: Record<string, unknown>) {
    await this.prisma.$executeRawUnsafe(
      `UPDATE transactions_paiement
         SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb,
             updated_at = now()
       WHERE id = $2`,
      JSON.stringify(ajout),
      id,
    );
  }

  /**
   * Applique un statut de façon idempotente : la mise à jour est conditionnée
   * en SQL au fait que la transaction ne soit pas déjà dans un statut terminal,
   * ce qui protège aussi des webhooks reçus en parallèle.
   */
  private async appliquerStatut(
    transaction: TransactionRow,
    statut: StatutTransaction,
    details: Record<string, unknown>,
  ) {
    // Liste inlinée volontairement : constante interne au module, aucune
    // donnée utilisateur n'entre dans cette clause.
    const clauseTerminaux = STATUTS_TERMINAUX.map((s) => `'${s}'`).join(', ');

    const lignes = await this.prisma.$executeRawUnsafe(
      `UPDATE transactions_paiement
         SET statut = $1,
             metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
             updated_at = now()
       WHERE id = $3
         AND statut NOT IN (${clauseTerminaux})`,
      statut,
      JSON.stringify(details),
      transaction.id,
    );
    return Number(lignes) > 0;
  }

  // =====================================================================
  // Listes et statistiques (inchangées)
  // =====================================================================

  async getTransactions(
    orgId: string,
    params: { page?: number; limit?: number; type?: string; statut?: string },
  ) {
    await this.ensureTable();
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    let where = `WHERE organisation_id = $1`;
    const args: unknown[] = [orgId];
    let idx = 2;

    if (params.type) {
      where += ` AND type = $${idx++}`;
      args.push(params.type);
    }
    if (params.statut) {
      where += ` AND statut = $${idx++}`;
      args.push(params.statut);
    }

    const rows = await this.prisma.$queryRawUnsafe<TransactionRow[]>(
      `SELECT * FROM transactions_paiement ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      ...args,
      limit,
      offset,
    );

    const countRows = await this.prisma.$queryRawUnsafe<Array<{ count: string }>>(
      `SELECT COUNT(*) as count FROM transactions_paiement ${where}`,
      ...args,
    );

    return {
      data: rows,
      total: Number(countRows[0]?.count ?? 0),
      page,
      limit,
    };
  }

  async getStats(orgId: string) {
    await this.ensureTable();
    const rows = await this.prisma.$queryRawUnsafe<Array<{ statut: string; count: string; total: string }>>(
      `SELECT statut, COUNT(*) as count, COALESCE(SUM(montant),0) as total
       FROM transactions_paiement
       WHERE organisation_id = $1
       GROUP BY statut`,
      orgId,
    );

    const totalCollecte = rows
      .filter((r) => r.statut === 'SUCCES')
      .reduce((s, r) => s + Number(r.total), 0);
    const nbTotal = rows.reduce((s, r) => s + Number(r.count), 0);
    const nbSucces = rows.filter((r) => r.statut === 'SUCCES').reduce((s, r) => s + Number(r.count), 0);

    return {
      totalCollecte,
      nbTransactions: nbTotal,
      tauxSucces: nbTotal > 0 ? Math.round((nbSucces / nbTotal) * 100) : 0,
      parStatut: rows.map((r) => ({ statut: r.statut, count: Number(r.count), total: Number(r.total) })),
    };
  }
}
