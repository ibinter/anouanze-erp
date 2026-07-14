import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TypeNotification } from '@prisma/client';

@Injectable()
export class NotificationsRestService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(utilisateurId: string, params?: { lue?: boolean; page?: number; limit?: number }) {
    const { lue, page = 1, limit = 20 } = params ?? {};
    const skip = (page - 1) * limit;

    const where = {
      utilisateurId,
      ...(lue !== undefined ? { lue } : {}),
    };

    const [data, total, nonLues] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { utilisateurId, lue: false } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit), nonLues } };
  }

  async marquerLue(utilisateurId: string, id: string) {
    return this.prisma.notification.update({
      where: { id, utilisateurId },
      data: { lue: true },
    });
  }

  async marquerToutesLues(utilisateurId: string) {
    await this.prisma.notification.updateMany({
      where: { utilisateurId, lue: false },
      data: { lue: true },
    });
    return { success: true };
  }

  async creerNotification(data: {
    utilisateurId?: string;
    organisationId?: string;
    type: TypeNotification;
    titre: string;
    message: string;
    lien?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  async supprimerNotification(utilisateurId: string, id: string) {
    await this.prisma.notification.delete({ where: { id, utilisateurId } });
    return { success: true };
  }

  async diffuserOrganisation(orgId: string, data: { type: TypeNotification; titre: string; message: string; lien?: string }) {
    // Récupérer tous les utilisateurs de l'organisation
    const membres = await this.prisma.utilisateurOrganisation.findMany({
      where: { organisationId: orgId },
      select: { utilisateurId: true },
    });

    await this.prisma.notification.createMany({
      data: membres.map((m) => ({
        utilisateurId: m.utilisateurId,
        organisationId: orgId,
        ...data,
      })),
    });

    return { success: true, count: membres.length };
  }
}
