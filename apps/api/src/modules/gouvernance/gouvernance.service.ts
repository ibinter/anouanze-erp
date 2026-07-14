import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TypeOrgane, StatutResolution } from '@prisma/client';

@Injectable()
export class GouvernanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Organes ────────────────────────────────────────────────

  async getOrganes(orgId: string) {
    return this.prisma.organeGouvernance.findMany({
      where: { organisationId: orgId },
      include: {
        _count: { select: { reunions: true, resolutions: true } },
        reunions: {
          orderBy: { dateReunion: 'asc' },
          where: { dateReunion: { gte: new Date() } },
          take: 1,
          select: { dateReunion: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createOrgane(orgId: string, data: { nom: string; type?: TypeOrgane; description?: string; nbMembres?: number }) {
    return this.prisma.organeGouvernance.create({
      data: { organisationId: orgId, ...data },
    });
  }

  async updateOrgane(orgId: string, organeId: string, data: Partial<{ nom: string; type: TypeOrgane; description: string; nbMembres: number; statut: string }>) {
    return this.prisma.organeGouvernance.update({
      where: { id: organeId, organisationId: orgId },
      data,
    });
  }

  // ─── Réunions ───────────────────────────────────────────────

  async getReunions(orgId: string, organeId?: string) {
    return this.prisma.reunion.findMany({
      where: { organe: { organisationId: orgId }, ...(organeId ? { organeId } : {}) },
      include: { organe: { select: { nom: true } } },
      orderBy: { dateReunion: 'desc' },
    });
  }

  async createReunion(organeId: string, data: { titre: string; dateReunion: Date; lieu?: string; ordre?: string[] }) {
    return this.prisma.reunion.create({ data: { organeId, ...data } });
  }

  async updateReunion(reunionId: string, data: Partial<{ titre: string; dateReunion: Date; lieu: string; ordre: string[]; statut: string; procesVerbal: string }>) {
    return this.prisma.reunion.update({ where: { id: reunionId }, data });
  }

  // ─── Résolutions ────────────────────────────────────────────

  async getResolutions(orgId: string, params?: { statut?: StatutResolution; page?: number; limit?: number }) {
    const { statut, page = 1, limit = 20 } = params ?? {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.resolution.findMany({
        where: { organisationId: orgId, ...(statut ? { statut } : {}) },
        include: { organe: { select: { nom: true } } },
        orderBy: { dateAdoption: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.resolution.count({ where: { organisationId: orgId, ...(statut ? { statut } : {}) } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createResolution(orgId: string, data: {
    reference: string; titre: string; description?: string;
    organeId?: string; reunionId?: string;
    dateAdoption?: Date; dateEcheance?: Date; responsable?: string;
  }) {
    return this.prisma.resolution.create({ data: { organisationId: orgId, ...data } });
  }

  async updateResolution(orgId: string, id: string, data: Partial<{
    titre: string; description: string; statut: StatutResolution;
    dateAdoption: Date; dateEcheance: Date; responsable: string;
  }>) {
    return this.prisma.resolution.update({
      where: { id, organisationId: orgId },
      data,
    });
  }

  async getStats(orgId: string) {
    const now = new Date();
    const [organes, resolutions, prochaines] = await Promise.all([
      this.prisma.organeGouvernance.count({ where: { organisationId: orgId, statut: 'actif' } }),
      this.prisma.resolution.groupBy({
        by: ['statut'],
        where: { organisationId: orgId },
        _count: true,
      }),
      this.prisma.reunion.findFirst({
        where: { organe: { organisationId: orgId }, dateReunion: { gte: now }, statut: 'PLANIFIEE' },
        orderBy: { dateReunion: 'asc' },
        include: { organe: { select: { nom: true } } },
      }),
    ]);

    const totalMembres = await this.prisma.organeGouvernance.aggregate({
      where: { organisationId: orgId },
      _sum: { nbMembres: true },
    });

    return {
      organesActifs: organes,
      totalMembres: totalMembres._sum.nbMembres ?? 0,
      resolutionsParStatut: Object.fromEntries(resolutions.map((r) => [r.statut, r._count])),
      prochainReunion: prochaines,
    };
  }
}
