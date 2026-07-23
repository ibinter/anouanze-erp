import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CanalNotification, TypeNotification } from '@prisma/client';
import { TYPES_EVENEMENT } from '../../common/notifications/types-evenement';

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
   * Préférences de notification de l'utilisateur.
   *
   * Le modèle `PreferenceNotification` ne stocke que les *dérogations* :
   * l'absence de ligne vaut « activé ». On renvoie donc la matrice complète
   * (canal × type d'évènement) en fusionnant les valeurs par défaut avec
   * les enregistrements existants.
   */
  async getPreferences(utilisateurId: string) {
    const enregistrees = await this.prisma.preferenceNotification.findMany({
      where: { utilisateurId },
      orderBy: [{ canal: 'asc' }, { typeEvenement: 'asc' }],
    });

    const index = new Map(
      enregistrees.map((p) => [`${p.canal}:${p.typeEvenement}`, p.actif]),
    );

    const canaux = [CanalNotification.APPLICATION, CanalNotification.EMAIL].map((canal) => ({
      canal,
      libelle:
        canal === CanalNotification.EMAIL
          ? 'Notifications par email'
          : "Notifications dans l'application",
      evenements: TYPES_EVENEMENT.map((evt) => ({
        typeEvenement: evt.cle,
        libelle: evt.libelle,
        actif: index.get(`${canal}:${evt.cle}`) ?? true,
      })),
    }));

    return { disponible: true, canaux, typesEvenement: TYPES_EVENEMENT };
  }

  /**
   * Met à jour une ou plusieurs préférences (upsert sur la clé unique
   * utilisateur × canal × évènement).
   */
  async majPreferences(
    utilisateurId: string,
    preferences: Array<{ canal: CanalNotification; typeEvenement: string; actif: boolean }>,
  ) {
    const valides = (preferences ?? []).filter(
      (p) => p && p.canal && typeof p.typeEvenement === 'string' && p.typeEvenement.length > 0,
    );

    for (const pref of valides) {
      await this.prisma.preferenceNotification.upsert({
        where: {
          utilisateurId_canal_typeEvenement: {
            utilisateurId,
            canal: pref.canal,
            typeEvenement: pref.typeEvenement,
          },
        },
        create: {
          utilisateurId,
          canal: pref.canal,
          typeEvenement: pref.typeEvenement,
          actif: pref.actif !== false,
        },
        update: { actif: pref.actif !== false },
      });
    }

    return this.getPreferences(utilisateurId);
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
