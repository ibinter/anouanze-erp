import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProjetDto } from './dto/create-projet.dto';
import { CreateActiviteDto } from './dto/create-activite.dto';
import { StatutProjet } from '@prisma/client';

@Injectable()
export class ProjetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organisationId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      statut?: StatutProjet;
      secteur?: string;
    },
  ) {
    const { page = 1, limit = 20, search, statut, secteur } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { organisationId };

    if (statut) {
      where['statut'] = statut;
    }

    if (secteur) {
      where['secteurs'] = { has: secteur };
    }

    if (search) {
      where['OR'] = [
        { nom: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.projet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { activites: true, beneficiaires: true } } },
      }),
      this.prisma.projet.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, organisationId: string) {
    const projet = await this.prisma.projet.findFirst({
      where: { id, organisationId },
      include: {
        activites: { orderBy: { createdAt: 'desc' } },
        beneficiaires: { include: { beneficiaire: true } },
        budgets: true,
      },
    });

    if (!projet) {
      throw new NotFoundException(`Projet ${id} introuvable`);
    }

    return projet;
  }

  async create(organisationId: string, dto: CreateProjetDto) {
    return this.prisma.projet.create({
      data: {
        ...dto,
        organisationId,
        dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : undefined,
        dateFin: dto.dateFin ? new Date(dto.dateFin) : undefined,
      } as any,
    });
  }

  async update(id: string, organisationId: string, dto: Partial<CreateProjetDto>) {
    await this.findOne(id, organisationId);

    return this.prisma.projet.update({
      where: { id },
      data: {
        ...dto,
        dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : undefined,
        dateFin: dto.dateFin ? new Date(dto.dateFin) : undefined,
      } as any,
    });
  }

  async delete(id: string, organisationId: string) {
    await this.findOne(id, organisationId);
    await this.prisma.projet.delete({ where: { id } });
    return { message: 'Projet supprimé avec succès' };
  }

  async getActivites(projetId: string) {
    return this.prisma.activite.findMany({
      where: { projetId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createActivite(projetId: string, dto: CreateActiviteDto) {
    const projet = await this.prisma.projet.findUnique({ where: { id: projetId } });

    if (!projet) {
      throw new NotFoundException(`Projet ${projetId} introuvable`);
    }

    return this.prisma.activite.create({
      data: {
        ...dto,
        projetId,
        dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : undefined,
        dateFin: dto.dateFin ? new Date(dto.dateFin) : undefined,
      },
    });
  }

  async getBeneficiaires(projetId: string) {
    return this.prisma.projetBeneficiaire.findMany({
      where: { projetId },
      include: { beneficiaire: true },
    });
  }

  async ajouterBeneficiaire(
    projetId: string,
    beneficiaireId: string,
    dto: { services?: string[]; notes?: string; statut?: string },
  ) {
    const [projet, beneficiaire] = await Promise.all([
      this.prisma.projet.findUnique({ where: { id: projetId } }),
      this.prisma.beneficiaire.findUnique({ where: { id: beneficiaireId } }),
    ]);

    if (!projet) throw new NotFoundException(`Projet ${projetId} introuvable`);
    if (!beneficiaire) throw new NotFoundException(`Bénéficiaire ${beneficiaireId} introuvable`);

    return this.prisma.projetBeneficiaire.upsert({
      where: { projetId_beneficiaireId: { projetId, beneficiaireId } },
      create: { projetId, beneficiaireId, ...dto },
      update: { ...dto },
    });
  }

  async getStats(organisationId: string) {
    const [total, enCours, clotures, projets] = await Promise.all([
      this.prisma.projet.count({ where: { organisationId } }),
      this.prisma.projet.count({ where: { organisationId, statut: StatutProjet.EN_COURS } }),
      this.prisma.projet.count({ where: { organisationId, statut: StatutProjet.CLOTURE } }),
      this.prisma.projet.findMany({
        where: { organisationId },
        select: { budgetTotal: true },
      }),
    ]);

    const budgetTotal = projets.reduce(
      (sum, p) => sum + Number(p.budgetTotal ?? 0),
      0,
    );

    return { total, enCours, clotures, budgetTotal, budgetRealise: 0 };
  }
}
