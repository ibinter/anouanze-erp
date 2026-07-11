import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEvenementDto } from './dto/create-evenement.dto';
import { v4 as uuidv4 } from 'uuid';

interface InscriptionRow {
  id: string;
  evenement_id: string;
  membre_id: string;
  present: boolean;
  created_at: Date;
}

@Injectable()
export class EvenementsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureInscriptionsTable() {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS inscriptions_evenement (
        id TEXT PRIMARY KEY,
        evenement_id TEXT NOT NULL,
        membre_id TEXT NOT NULL,
        present BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(evenement_id, membre_id)
      )
    `);
  }

  async findAll(
    orgId: string,
    params: { type?: string; statut?: string; dateDebut?: string; dateFin?: string },
  ) {
    const where: Record<string, unknown> = { organisationId: orgId };
    if (params.type) where['type'] = params.type;
    if (params.statut) where['statut'] = params.statut;
    if (params.dateDebut || params.dateFin) {
      where['dateDebut'] = {
        ...(params.dateDebut ? { gte: new Date(params.dateDebut) } : {}),
        ...(params.dateFin ? { lte: new Date(params.dateFin) } : {}),
      };
    }
    return this.prisma.evenement.findMany({
      where,
      orderBy: { dateDebut: 'asc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const ev = await this.prisma.evenement.findFirst({ where: { id, organisationId: orgId } });
    if (!ev) throw new NotFoundException(`Événement ${id} introuvable`);
    return ev;
  }

  async create(orgId: string, dto: CreateEvenementDto) {
    return this.prisma.evenement.create({
      data: {
        organisationId: orgId,
        titre: dto.titre,
        description: dto.description,
        type: dto.type,
        dateDebut: new Date(dto.dateDebut),
        dateFin: dto.dateFin ? new Date(dto.dateFin) : undefined,
        lieu: dto.lieu,
        lienVisio: dto.lienVisio,
        capaciteMax: dto.capaciteMax,
        inscription: dto.inscription ?? false,
        statut: 'PLANIFIE',
      },
    });
  }

  async update(id: string, orgId: string, dto: Partial<CreateEvenementDto>) {
    await this.findOne(id, orgId);
    const { dateDebut, dateFin, ...rest } = dto;
    return this.prisma.evenement.update({
      where: { id },
      data: {
        ...rest,
        ...(dateDebut ? { dateDebut: new Date(dateDebut) } : {}),
        ...(dateFin ? { dateFin: new Date(dateFin) } : {}),
      },
    });
  }

  async delete(id: string, orgId: string) {
    await this.findOne(id, orgId);
    return this.prisma.evenement.delete({ where: { id } });
  }

  async inscrire(evenementId: string, membreId: string) {
    await this.ensureInscriptionsTable();

    const ev = await this.prisma.evenement.findUnique({ where: { id: evenementId } });
    if (!ev) throw new NotFoundException(`Événement ${evenementId} introuvable`);
    if (!ev.inscription) throw new BadRequestException('Les inscriptions ne sont pas ouvertes pour cet événement');

    if (ev.capaciteMax) {
      const count = await this.prisma.$queryRawUnsafe<Array<{ count: string }>>(
        `SELECT COUNT(*) as count FROM inscriptions_evenement WHERE evenement_id = $1`,
        evenementId,
      );
      if (Number(count[0]?.count ?? 0) >= ev.capaciteMax) {
        throw new BadRequestException('La capacité maximale de cet événement est atteinte');
      }
    }

    const id = uuidv4();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO inscriptions_evenement (id, evenement_id, membre_id) VALUES ($1, $2, $3)
       ON CONFLICT (evenement_id, membre_id) DO NOTHING`,
      id,
      evenementId,
      membreId,
    );
    return { inscrit: true, evenementId, membreId };
  }

  async getInscrits(evenementId: string) {
    await this.ensureInscriptionsTable();
    const rows = await this.prisma.$queryRawUnsafe<InscriptionRow[]>(
      `SELECT * FROM inscriptions_evenement WHERE evenement_id = $1 ORDER BY created_at ASC`,
      evenementId,
    );
    return rows;
  }

  async marquerPresence(evenementId: string, membreId: string) {
    await this.ensureInscriptionsTable();
    const rows = await this.prisma.$queryRawUnsafe<InscriptionRow[]>(
      `SELECT * FROM inscriptions_evenement WHERE evenement_id = $1 AND membre_id = $2`,
      evenementId,
      membreId,
    );
    if (!rows.length) throw new NotFoundException('Inscription introuvable');
    await this.prisma.$executeRawUnsafe(
      `UPDATE inscriptions_evenement SET present = true WHERE evenement_id = $1 AND membre_id = $2`,
      evenementId,
      membreId,
    );
    return { present: true };
  }
}
