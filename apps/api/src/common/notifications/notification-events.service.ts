import { Injectable, Logger } from '@nestjs/common';
import { RoleUtilisateur, TypeNotification } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from './notifications.gateway';

/**
 * Génération automatique des notifications internes sur les évènements métier.
 *
 * Ce service est *global* (exporté par NotificationsModule) : n'importe quel
 * module peut l'injecter et déclencher une notification sans se soucier de la
 * persistance, de la diffusion temps réel ni de l'email de relais.
 *
 * Règle absolue : **aucune méthode ne lève d'exception**. Un incident de
 * notification ne doit jamais faire échouer l'action métier appelante.
 */

/** Rôles considérés comme « décideurs » — cibles par défaut des alertes. */
export const ROLES_ADMIN: RoleUtilisateur[] = [
  RoleUtilisateur.SUPER_ADMIN,
  RoleUtilisateur.ADMIN_ORGANISATION,
  RoleUtilisateur.DIRECTEUR,
];

export const ROLES_FINANCE: RoleUtilisateur[] = [
  ...ROLES_ADMIN,
  RoleUtilisateur.COMPTABLE,
];

export interface NotificationPayload {
  type?: TypeNotification;
  titre: string;
  message: string;
  lien?: string;
  /** Envoyer aussi un email de relais aux destinataires (défaut : false). */
  email?: boolean;
}

interface CibleUtilisateur {
  id: string;
  email?: string | null;
  prenom?: string | null;
  nom?: string | null;
}

@Injectable()
export class NotificationEventsService {
  private readonly logger = new Logger(NotificationEventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
    private readonly email: EmailService,
  ) {}

  // ============================================================
  // Primitives
  // ============================================================

  /** Notifie un utilisateur précis. Ne lève jamais. */
  async notifierUtilisateur(
    utilisateurId: string,
    organisationId: string | null | undefined,
    payload: NotificationPayload,
  ): Promise<void> {
    await this.notifierUtilisateurs([utilisateurId], organisationId, payload);
  }

  /** Notifie une liste d'utilisateurs. Ne lève jamais. */
  async notifierUtilisateurs(
    utilisateurIds: string[],
    organisationId: string | null | undefined,
    payload: NotificationPayload,
  ): Promise<void> {
    const ids = Array.from(new Set(utilisateurIds.filter(Boolean)));
    if (ids.length === 0) return;

    try {
      await this.prisma.notification.createMany({
        data: ids.map((utilisateurId) => ({
          utilisateurId,
          organisationId: organisationId ?? null,
          type: payload.type ?? TypeNotification.INFO,
          titre: payload.titre,
          message: payload.message,
          lien: payload.lien ?? null,
        })),
      });

      for (const id of ids) {
        try {
          this.gateway.sendToUser(id, 'notification', {
            type: payload.type ?? TypeNotification.INFO,
            titre: payload.titre,
            message: payload.message,
            lien: payload.lien,
            createdAt: new Date().toISOString(),
          });
        } catch {
          /* le temps réel est un bonus — jamais bloquant */
        }
      }

      this.logger.log(
        `Notification « ${payload.titre} » créée pour ${ids.length} utilisateur(s)` +
          (organisationId ? ` (org ${organisationId})` : ''),
      );

      if (payload.email) {
        await this.relayerParEmail(ids, payload);
      }
    } catch (err) {
      this.logger.error(
        `Échec création notification « ${payload.titre} » : ${(err as Error).message}`,
      );
    }
  }

  /** Notifie tous les membres d'une organisation portant l'un des rôles indiqués. */
  async notifierRoles(
    organisationId: string,
    roles: RoleUtilisateur[],
    payload: NotificationPayload,
  ): Promise<void> {
    try {
      const cibles = await this.prisma.utilisateurOrganisation.findMany({
        where: { organisationId, actif: true, role: { in: roles } },
        select: { utilisateurId: true },
      });

      if (cibles.length === 0) {
        this.logger.debug(
          `Aucun destinataire (${roles.join(', ')}) dans l'org ${organisationId} pour « ${payload.titre} »`,
        );
        return;
      }

      await this.notifierUtilisateurs(
        cibles.map((c) => c.utilisateurId),
        organisationId,
        payload,
      );
    } catch (err) {
      this.logger.error(`Échec ciblage rôles : ${(err as Error).message}`);
    }
  }

  /** Notifie toute l'organisation. */
  async notifierOrganisation(organisationId: string, payload: NotificationPayload): Promise<void> {
    try {
      const membres = await this.prisma.utilisateurOrganisation.findMany({
        where: { organisationId, actif: true },
        select: { utilisateurId: true },
      });
      await this.notifierUtilisateurs(
        membres.map((m) => m.utilisateurId),
        organisationId,
        payload,
      );
    } catch (err) {
      this.logger.error(`Échec diffusion organisation : ${(err as Error).message}`);
    }
  }

  private async relayerParEmail(utilisateurIds: string[], payload: NotificationPayload): Promise<void> {
    if (!this.email.isConfigured()) return;
    try {
      const users: CibleUtilisateur[] = await this.prisma.utilisateur.findMany({
        where: { id: { in: utilisateurIds }, actif: true },
        select: { id: true, email: true, prenom: true, nom: true },
      });

      for (const u of users) {
        if (!u.email) continue;
        await this.email.sendNotificationGenerique(u.email, {
          nom: [u.prenom, u.nom].filter(Boolean).join(' ') || undefined,
          titre: payload.titre,
          message: payload.message,
          lien: payload.lien,
        });
      }
    } catch (err) {
      this.logger.warn(`Relais email des notifications ignoré : ${(err as Error).message}`);
    }
  }

  // ============================================================
  // Évènements métier
  // ============================================================

  /**
   * Cotisation en retard.
   * Notifie le membre concerné (s'il possède un compte) + les responsables finance.
   */
  async cotisationEnRetard(params: {
    organisationId: string;
    membreNom: string;
    montant: number;
    echeance: Date | string;
    joursRetard?: number;
    utilisateurId?: string | null;
    emailMembre?: string | null;
    devise?: string;
    organisationNom?: string;
  }): Promise<void> {
    const retard = params.joursRetard ? ` (${params.joursRetard} j de retard)` : '';
    const montant = `${Number(params.montant ?? 0).toLocaleString('fr-FR')} ${params.devise ?? 'FCFA'}`;

    await this.notifierRoles(params.organisationId, ROLES_FINANCE, {
      type: TypeNotification.AVERTISSEMENT,
      titre: 'Cotisation en retard',
      message: `La cotisation de ${params.membreNom} (${montant}) est échue${retard}.`,
      lien: '/cotisations',
    });

    if (params.utilisateurId) {
      await this.notifierUtilisateur(params.utilisateurId, params.organisationId, {
        type: TypeNotification.RAPPEL,
        titre: 'Votre cotisation est en retard',
        message: `Votre cotisation de ${montant} est échue${retard}. Merci de régulariser votre situation.`,
        lien: '/cotisations',
      });
    }

    if (params.emailMembre) {
      await this.email.sendCotisationReminder(
        params.emailMembre,
        params.membreNom,
        Number(params.montant ?? 0),
        params.echeance,
        {
          joursRetard: params.joursRetard,
          devise: params.devise,
          organisationNom: params.organisationNom,
        },
      );
    }
  }

  /**
   * Seuil budgétaire atteint (alerte à partir de 90 %, dépassement à 100 %).
   */
  async budgetSeuilAtteint(params: {
    organisationId: string;
    budgetId?: string;
    budgetNom: string;
    pourcentageConsomme: number;
    montantConsomme?: number;
    montantTotal?: number;
    devise?: string;
    seuil?: number;
  }): Promise<void> {
    const seuil = params.seuil ?? 90;
    if (params.pourcentageConsomme < seuil) return;

    const depasse = params.pourcentageConsomme >= 100;
    const pct = Math.round(params.pourcentageConsomme);

    await this.notifierRoles(params.organisationId, ROLES_FINANCE, {
      type: depasse ? TypeNotification.ALERTE : TypeNotification.AVERTISSEMENT,
      titre: depasse ? `Budget dépassé : ${params.budgetNom}` : `Budget à ${pct} % : ${params.budgetNom}`,
      message: depasse
        ? `L'enveloppe du budget « ${params.budgetNom} » est dépassée (${pct} % consommés).`
        : `Le budget « ${params.budgetNom} » atteint ${pct} % de son enveloppe.`,
      lien: params.budgetId ? `/budget?id=${params.budgetId}` : '/budget',
    });
  }

  /** Nouveau ticket support ouvert. */
  async nouveauTicket(params: {
    organisationId?: string | null;
    ticketId: string;
    reference: string;
    sujet: string;
    priorite?: string;
    categorie?: string;
    auteurNom?: string;
    auteurUtilisateurId?: string | null;
    auteurEmail?: string | null;
  }): Promise<void> {
    if (params.organisationId) {
      await this.notifierRoles(params.organisationId, ROLES_ADMIN, {
        type: params.priorite === 'URGENTE' ? TypeNotification.ALERTE : TypeNotification.INFO,
        titre: `Nouveau ticket ${params.reference}`,
        message: `${params.auteurNom ?? 'Un utilisateur'} a ouvert le ticket « ${params.sujet} »${
          params.priorite ? ` (priorité ${params.priorite})` : ''
        }.`,
        lien: `/support/${params.ticketId}`,
      });
    }

    if (params.auteurUtilisateurId) {
      await this.notifierUtilisateur(params.auteurUtilisateurId, params.organisationId, {
        type: TypeNotification.SUCCES,
        titre: `Ticket ${params.reference} enregistré`,
        message: `Votre demande « ${params.sujet} » a bien été transmise au support.`,
        lien: `/support/${params.ticketId}`,
      });
    }

    if (params.auteurEmail) {
      await this.email.sendNouveauTicket(params.auteurEmail, {
        nom: params.auteurNom ?? 'Utilisateur',
        reference: params.reference,
        sujet: params.sujet,
        priorite: params.priorite,
        categorie: params.categorie,
        ticketId: params.ticketId,
      });
    }
  }

  /** Réponse apportée à un ticket support. */
  async reponseTicket(params: {
    organisationId?: string | null;
    ticketId: string;
    reference: string;
    sujet: string;
    message: string;
    auteur?: string;
    statut?: string;
    destinataireUtilisateurId?: string | null;
    destinataireEmail?: string | null;
    destinataireNom?: string;
  }): Promise<void> {
    if (params.destinataireUtilisateurId) {
      await this.notifierUtilisateur(params.destinataireUtilisateurId, params.organisationId, {
        type: TypeNotification.INFO,
        titre: `Réponse au ticket ${params.reference}`,
        message: `${params.auteur ?? 'Le support'} a répondu à « ${params.sujet} ».`,
        lien: `/support/${params.ticketId}`,
      });
    }

    if (params.destinataireEmail) {
      await this.email.sendReponseTicket(params.destinataireEmail, {
        nom: params.destinataireNom ?? 'Utilisateur',
        reference: params.reference,
        sujet: params.sujet,
        auteur: params.auteur,
        message: params.message,
        statut: params.statut,
        ticketId: params.ticketId,
      });
    }
  }

  /** Résolution de gouvernance en attente d'application / d'approbation. */
  async resolutionEnAttente(params: {
    organisationId: string;
    resolutionId?: string;
    intitule: string;
    echeance?: Date | string | null;
    responsableUtilisateurId?: string | null;
  }): Promise<void> {
    const ech = params.echeance
      ? ` — échéance ${new Date(params.echeance).toLocaleDateString('fr-FR')}`
      : '';

    const payload: NotificationPayload = {
      type: TypeNotification.RAPPEL,
      titre: 'Résolution en attente',
      message: `La résolution « ${params.intitule} » est toujours en attente${ech}.`,
      lien: '/gouvernance',
    };

    if (params.responsableUtilisateurId) {
      await this.notifierUtilisateur(params.responsableUtilisateurId, params.organisationId, payload);
    } else {
      await this.notifierRoles(params.organisationId, ROLES_ADMIN, payload);
    }
  }

  /** Don reçu : alerte interne + reçu au donateur. */
  async donRecu(params: {
    organisationId: string;
    donateurNom: string;
    donateurEmail?: string | null;
    montant?: number | null;
    devise?: string;
    dateDon: Date | string;
    numeroRecu?: string;
    typeDon?: string;
    organisationNom?: string;
  }): Promise<void> {
    const montantTxt =
      params.montant !== null && params.montant !== undefined
        ? `${Number(params.montant).toLocaleString('fr-FR')} ${params.devise ?? 'FCFA'}`
        : 'don en nature';

    await this.notifierRoles(params.organisationId, ROLES_FINANCE, {
      type: TypeNotification.SUCCES,
      titre: 'Nouveau don reçu',
      message: `${params.donateurNom} a effectué un don de ${montantTxt}.`,
      lien: '/donateurs',
    });

    if (params.donateurEmail) {
      await this.email.sendRecuDon(
        params.donateurEmail,
        { nom: params.donateurNom },
        {
          montant: params.montant,
          dateDon: params.dateDon,
          numeroRecu: params.numeroRecu,
          type: params.typeDon ?? 'Don',
        },
        params.organisationNom,
      );
    }
  }

  /** Cotisation encaissée : confirmation au membre. */
  async cotisationReglee(params: {
    organisationId: string;
    membreNom: string;
    membreEmail?: string | null;
    utilisateurId?: string | null;
    montant: number;
    devise?: string;
    periode?: string;
    datePaiement: Date | string;
    reference?: string;
    organisationNom?: string;
  }): Promise<void> {
    const montant = `${Number(params.montant ?? 0).toLocaleString('fr-FR')} ${params.devise ?? 'FCFA'}`;

    if (params.utilisateurId) {
      await this.notifierUtilisateur(params.utilisateurId, params.organisationId, {
        type: TypeNotification.SUCCES,
        titre: 'Cotisation enregistrée',
        message: `Votre cotisation de ${montant} a bien été enregistrée.`,
        lien: '/cotisations',
      });
    }

    if (params.membreEmail) {
      await this.email.sendConfirmationCotisation(params.membreEmail, {
        nom: params.membreNom,
        montant: Number(params.montant ?? 0),
        devise: params.devise,
        periode: params.periode,
        datePaiement: params.datePaiement,
        reference: params.reference,
        organisationNom: params.organisationNom,
      });
    }
  }
}
