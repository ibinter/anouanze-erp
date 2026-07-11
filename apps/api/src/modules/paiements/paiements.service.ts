import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InitierPaiementDto } from './dto/initier-paiement.dto';
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
  metadata: unknown;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class PaiementsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async initierPaiement(orgId: string, dto: InitierPaiementDto) {
    await this.ensureTable();
    const id = uuidv4();
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO transactions_paiement
        (id, organisation_id, montant, devise, description, payeur_email, payeur_tel, projet_id, donateur_id, type, statut, reference)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'EN_ATTENTE', $11)`,
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
    );

    return { id, reference, statut: 'EN_ATTENTE', montant: dto.montant, devise: dto.devise };
  }

  async verifierStatut(transactionId: string) {
    await this.ensureTable();
    const rows = await this.prisma.$queryRawUnsafe<TransactionRow[]>(
      `SELECT * FROM transactions_paiement WHERE id = $1`,
      transactionId,
    );
    if (!rows.length) throw new NotFoundException(`Transaction ${transactionId} introuvable`);
    return rows[0];
  }

  async webhookCinetpay(payload: Record<string, unknown>) {
    await this.ensureTable();
    const transactionId = payload['transaction_id'] as string;
    const statut = payload['payment_status'] === 'ACCEPTED' ? 'SUCCES' : 'ECHEC';
    await this.prisma.$executeRawUnsafe(
      `UPDATE transactions_paiement SET statut = $1, reference = $2, metadata = $3::jsonb, updated_at = now() WHERE id = $4`,
      statut,
      payload['transaction_id'] as string,
      JSON.stringify(payload),
      transactionId,
    );
    return { received: true };
  }

  async webhookOrangeMoney(payload: Record<string, unknown>) {
    await this.ensureTable();
    const transactionId = payload['txnid'] as string;
    const statut = payload['status'] === 'SUCCESS' ? 'SUCCES' : 'ECHEC';
    await this.prisma.$executeRawUnsafe(
      `UPDATE transactions_paiement SET statut = $1, reference = $2, metadata = $3::jsonb, updated_at = now() WHERE id = $4`,
      statut,
      payload['txnid'] as string,
      JSON.stringify(payload),
      transactionId,
    );
    return { received: true };
  }

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
