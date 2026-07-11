import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface LogData {
  organisationId?: string;
  utilisateurId?: string;
  action: string;
  ressource: string;
  ressourceId?: string;
  avant?: unknown;
  apres?: unknown;
  ipAdresse?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: LogData) {
    return this.prisma.logAudit.create({
      data: {
        organisationId: data.organisationId,
        utilisateurId: data.utilisateurId,
        action: data.action,
        ressource: data.ressource,
        ressourceId: data.ressourceId,
        avant: data.avant !== undefined ? (data.avant as object) : undefined,
        apres: data.apres !== undefined ? (data.apres as object) : undefined,
        ipAdresse: data.ipAdresse,
        userAgent: data.userAgent,
      },
    });
  }

  async findAll(
    orgId: string,
    params: {
      page?: number;
      limit?: number;
      action?: string;
      ressource?: string;
      utilisateurId?: string;
      dateDebut?: string;
      dateFin?: string;
    },
  ) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { organisationId: orgId };
    if (params.action) where['action'] = params.action;
    if (params.ressource) where['ressource'] = params.ressource;
    if (params.utilisateurId) where['utilisateurId'] = params.utilisateurId;
    if (params.dateDebut || params.dateFin) {
      where['createdAt'] = {
        ...(params.dateDebut ? { gte: new Date(params.dateDebut) } : {}),
        ...(params.dateFin ? { lte: new Date(params.dateFin) } : {}),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.logAudit.findMany({
        where,
        include: { utilisateur: { select: { id: true, nom: true, prenom: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.logAudit.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getStats(orgId: string) {
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);

    const logs = await this.prisma.logAudit.findMany({
      where: { organisationId: orgId, createdAt: { gte: debutMois } },
      select: { action: true, utilisateurId: true, utilisateur: { select: { nom: true, prenom: true } } },
    });

    const parAction: Record<string, number> = {};
    const parUser: Record<string, { nom: string; count: number }> = {};

    for (const l of logs) {
      parAction[l.action] = (parAction[l.action] ?? 0) + 1;
      if (l.utilisateurId) {
        if (!parUser[l.utilisateurId]) {
          parUser[l.utilisateurId] = {
            nom: l.utilisateur ? `${l.utilisateur.prenom ?? ''} ${l.utilisateur.nom}`.trim() : l.utilisateurId,
            count: 0,
          };
        }
        parUser[l.utilisateurId].count++;
      }
    }

    const utilisateursActifs = Object.entries(parUser)
      .map(([id, v]) => ({ utilisateurId: id, nom: v.nom, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalCeMois: logs.length,
      parAction: Object.entries(parAction).map(([action, count]) => ({ action, count })),
      utilisateursActifs,
    };
  }
}
