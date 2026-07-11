import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCompteBancaireDto } from './dto/create-compte-bancaire.dto';
import { CreateMouvementDto } from './dto/create-mouvement.dto';

@Injectable()
export class TresorerieService {
  constructor(private readonly prisma: PrismaService) {}

  async getComptesBancaires(organisationId: string) {
    const comptes = await this.prisma.compteBancaire.findMany({
      where: { organisationId },
      include: { mouvements: { select: { debit: true, credit: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return comptes.map((compte) => {
      const totalCredit = compte.mouvements.reduce((s, m) => s + Number(m.credit), 0);
      const totalDebit = compte.mouvements.reduce((s, m) => s + Number(m.debit), 0);
      const solde = Number(compte.soldeInitial) + totalCredit - totalDebit;

      const { mouvements: _, ...rest } = compte;
      return { ...rest, solde };
    });
  }

  async createCompteBancaire(organisationId: string, dto: CreateCompteBancaireDto) {
    return this.prisma.compteBancaire.create({ data: { ...dto, organisationId } });
  }

  async getMouvements(
    compteId: string,
    params: {
      page?: number;
      limit?: number;
      dateDebut?: string;
      dateFin?: string;
    },
  ) {
    const compte = await this.prisma.compteBancaire.findUnique({ where: { id: compteId } });
    if (!compte) throw new NotFoundException(`Compte ${compteId} introuvable`);

    const { page = 1, limit = 50, dateDebut, dateFin } = params;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { compteId };

    if (dateDebut || dateFin) {
      where['date'] = {};
      if (dateDebut) (where['date'] as Record<string, unknown>)['gte'] = new Date(dateDebut);
      if (dateFin) (where['date'] as Record<string, unknown>)['lte'] = new Date(dateFin);
    }

    const [data, total] = await Promise.all([
      this.prisma.mouvementBancaire.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.mouvementBancaire.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createMouvement(compteId: string, dto: CreateMouvementDto) {
    const compte = await this.prisma.compteBancaire.findUnique({ where: { id: compteId } });
    if (!compte) throw new NotFoundException(`Compte ${compteId} introuvable`);

    if (!dto.debit && !dto.credit) {
      throw new BadRequestException('Un mouvement doit avoir un débit ou un crédit');
    }

    return this.prisma.mouvementBancaire.create({
      data: {
        ...dto,
        compteId,
        date: new Date(dto.date),
        debit: dto.debit ?? 0,
        credit: dto.credit ?? 0,
      },
    });
  }

  async getSolde(compteId: string) {
    const compte = await this.prisma.compteBancaire.findUnique({
      where: { id: compteId },
      include: { mouvements: { select: { debit: true, credit: true } } },
    });

    if (!compte) throw new NotFoundException(`Compte ${compteId} introuvable`);

    const totalCredit = compte.mouvements.reduce((s, m) => s + Number(m.credit), 0);
    const totalDebit = compte.mouvements.reduce((s, m) => s + Number(m.debit), 0);
    const solde = Number(compte.soldeInitial) + totalCredit - totalDebit;

    return { compteId, soldeInitial: Number(compte.soldeInitial), totalCredit, totalDebit, solde };
  }

  async rapprocher(mouvementId: string) {
    const mouvement = await this.prisma.mouvementBancaire.findUnique({
      where: { id: mouvementId },
    });

    if (!mouvement) throw new NotFoundException(`Mouvement ${mouvementId} introuvable`);
    if (mouvement.rapproche) {
      throw new BadRequestException('Ce mouvement est déjà rapproché');
    }

    return this.prisma.mouvementBancaire.update({
      where: { id: mouvementId },
      data: { rapproche: true },
    });
  }

  async getSituationTresorerie(organisationId: string) {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    const comptes = await this.prisma.compteBancaire.findMany({
      where: { organisationId, actif: true },
      include: { mouvements: { select: { debit: true, credit: true, date: true } } },
    });

    let soldeTotalTousComptes = 0;
    const comptesAvecSolde = comptes.map((compte) => {
      const totalCredit = compte.mouvements.reduce((s, m) => s + Number(m.credit), 0);
      const totalDebit = compte.mouvements.reduce((s, m) => s + Number(m.debit), 0);
      const solde = Number(compte.soldeInitial) + totalCredit - totalDebit;
      soldeTotalTousComptes += solde;

      const { mouvements: _, ...rest } = compte;
      return { ...rest, solde };
    });

    const mouvementsMois = await this.prisma.mouvementBancaire.findMany({
      where: {
        compte: { organisationId },
        date: { gte: debutMois },
      },
      orderBy: { date: 'desc' },
    });

    const entreesMois = mouvementsMois.reduce((s, m) => s + Number(m.credit), 0);
    const sortiesMois = mouvementsMois.reduce((s, m) => s + Number(m.debit), 0);

    return {
      soldeTotalTousComptes,
      comptes: comptesAvecSolde,
      mois: {
        entrees: entreesMois,
        sorties: sortiesMois,
        net: entreesMois - sortiesMois,
        nombreMouvements: mouvementsMois.length,
      },
    };
  }
}
