import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organisationId: string, exercice?: number) {
    const where: Record<string, unknown> = { organisationId };
    if (exercice) where['exercice'] = exercice;

    return this.prisma.budget.findMany({
      where,
      include: { lignes: true, projet: { select: { id: true, nom: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organisationId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, organisationId },
      include: { lignes: true, projet: { select: { id: true, nom: true, code: true } } },
    });

    if (!budget) throw new NotFoundException(`Budget ${id} introuvable`);
    return budget;
  }

  async create(organisationId: string, dto: CreateBudgetDto) {
    if (dto.projetId) {
      const projet = await this.prisma.projet.findFirst({
        where: { id: dto.projetId, organisationId },
      });
      if (!projet) throw new NotFoundException(`Projet ${dto.projetId} introuvable`);
    }

    return this.prisma.budget.create({
      data: {
        organisationId,
        projetId: dto.projetId,
        exercice: dto.exercice,
        nom: dto.nom,
        statut: dto.statut ?? 'BROUILLON',
        lignes: {
          create: dto.lignes.map((l) => ({
            categorie: l.categorie,
            description: l.description,
            montantPrevu: l.montantPrevu,
            devise: l.devise,
          })),
        },
      },
      include: { lignes: true },
    });
  }

  async update(id: string, organisationId: string, dto: Partial<CreateBudgetDto>) {
    const budget = await this.findOne(id, organisationId);

    if (budget.statut === 'APPROUVE') {
      throw new BadRequestException('Un budget approuvé ne peut pas être modifié');
    }

    const { lignes, ...rest } = dto;

    if (lignes) {
      await this.prisma.ligneBudget.deleteMany({ where: { budgetId: id } });
      await this.prisma.ligneBudget.createMany({
        data: lignes.map((l) => ({
          budgetId: id,
          categorie: l.categorie,
          description: l.description,
          montantPrevu: l.montantPrevu,
          devise: l.devise ?? 'XOF',
        })),
      });
    }

    return this.prisma.budget.update({
      where: { id },
      data: rest,
      include: { lignes: true },
    });
  }

  async approuver(id: string, organisationId: string) {
    const budget = await this.findOne(id, organisationId);

    if (budget.statut === 'APPROUVE') {
      throw new BadRequestException('Ce budget est déjà approuvé');
    }

    return this.prisma.budget.update({
      where: { id },
      data: { statut: 'APPROUVE', dateApprobation: new Date() },
      include: { lignes: true },
    });
  }

  async getTauxExecution(id: string, organisationId: string) {
    const budget = await this.findOne(id, organisationId);

    const montantPrevu = budget.lignes.reduce(
      (sum, l) => sum + Number(l.montantPrevu),
      0,
    );

    const ecritures = await this.prisma.ecritureComptable.findMany({
      where: {
        organisationId,
        exercice: budget.exercice,
        projetId: budget.projetId ?? undefined,
        valide: true,
      },
      select: { totalDebit: true },
    });

    const montantRealise = ecritures.reduce(
      (sum, e) => sum + Number(e.totalDebit),
      0,
    );

    const tauxExecution =
      montantPrevu > 0 ? Math.round((montantRealise / montantPrevu) * 100) : 0;

    return {
      budgetId: id,
      exercice: budget.exercice,
      nom: budget.nom,
      montantPrevu,
      montantRealise,
      ecart: montantPrevu - montantRealise,
      tauxExecution,
    };
  }
}
