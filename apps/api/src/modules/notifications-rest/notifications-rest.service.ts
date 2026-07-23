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

  /** Compteur léger destiné à la cloche du header (interrogé périodiquement). */
  async compterNonLues(utilisateurId: string) {
    const nonLues = await this.prisma.notification.count({
      where: { utilisateurId, lue: false },
    });
    return { nonLues };
  }

  /**
   * Aperçu des dernières notifications — utilisé par le panneau déroulant
   * de la cloche (charge utile volontairement réduite).
   */
  async apercu(utilisateurId: string, limit = 8) {
    const [data, nonLues] = await Promise.all([
      this.prisma.notification.findMany({
        where: { utilisateurId },
        orderBy: [{ lue: 'asc' }, { createdAt: 'desc' }],
        take: Math.min(Math.max(limit, 1), 20),
        select: {
          id: true,
          titre: true,
          message: true,
          type: true,
          lue: true,
          lien: true,
          createdAt: true,
        },
      }),
      this.prisma.notification.count({ where: { utilisateurId, lue: false } }),
    ]);

    return { data, nonLues };
  }

  /**
   * Préférences de notification.
   *
   * Le schéma Prisma actuel ne comporte aucun modèle de préférences
   * (cf. rapport technique : modèle `PreferenceNotification` à créer).
   * On expose donc une réponse honnête que l'interface affiche en
   * « Bientôt disponible » plutôt que de simuler une fonctionnalité.
   */
  async getPreferences(_utilisateurId: string) {
    return {
      disponible: false,
      message:
        'La personnalisation des préférences de notification sera disponible prochainement.',
      canaux: [
        { cle: 'interne', libelle: 'Notifications dans l\'application', actif: true, modifiable: false },
        { cle: 'email', libelle: 'Notifications par email', actif: true, modifiable: false },
      ],
    };
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
