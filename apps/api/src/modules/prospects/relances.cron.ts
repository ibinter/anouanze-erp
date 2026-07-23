import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoleUtilisateur, StatutAbonnement, StatutProspect } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../../common/email/email.service';

/**
 * Tâches planifiées du cycle commercial et du cycle d'essai.
 *
 * Règles communes à tous les jobs :
 *  - **idempotents** : une colonne « relance…EnvoyeeLe » horodate chaque envoi,
 *    un job rejoué le même jour ne réexpédie rien ;
 *  - **journalisés** : chaque exécution résume ce qui a été traité ;
 *  - **résilients** : un `try/catch` par élément, la boucle n'est jamais
 *    interrompue par un destinataire en erreur.
 */
@Injectable()
export class RelancesCron {
  private readonly logger = new Logger(RelancesCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  // ============================================================
  // Relances prospects (J+3 puis J+7)
  // ============================================================

  /** Tous les jours à 09 h 00 (heure du serveur). */
  @Cron(CronExpression.EVERY_DAY_AT_9AM, { name: 'relances-prospects' })
  async relancerProspects(): Promise<void> {
    await this.relancerProspectsJour(3);
    await this.relancerProspectsJour(7);
  }

  private async relancerProspectsJour(jours: 3 | 7): Promise<void> {
    const champ = jours === 3 ? 'relanceJ3EnvoyeeLe' : 'relanceJ7EnvoyeeLe';
    const seuil = new Date(Date.now() - jours * 24 * 60 * 60 * 1000);

    // Statuts « froids » uniquement : un prospect gagné, perdu ou déjà en
    // négociation ne reçoit pas de relance automatique.
    const statutsRelancables: StatutProspect[] = [
      StatutProspect.NOUVEAU,
      StatutProspect.A_CONTACTER,
      StatutProspect.CONTACTE,
    ];

    let prospects: Array<{
      id: string;
      nom: string;
      prenom: string | null;
      email: string;
      organisation: string | null;
    }> = [];

    try {
      prospects = await this.prisma.prospect.findMany({
        where: {
          statut: { in: statutsRelancables },
          createdAt: { lte: seuil },
          [champ]: null,
        },
        select: { id: true, nom: true, prenom: true, email: true, organisation: true },
        take: 500,
      });
    } catch (err) {
      this.logger.error(`[relance-prospect-J+${jours}] lecture impossible : ${(err as Error).message}`);
      return;
    }

    if (prospects.length === 0) {
      this.logger.debug(`[relance-prospect-J+${jours}] aucun prospect à relancer`);
      return;
    }

    let envoyes = 0;
    for (const p of prospects) {
      try {
        await this.email.sendRelanceProspect(p.email, {
          nomContact: [p.prenom, p.nom].filter(Boolean).join(' ') || p.nom,
          organisationNom: p.organisation ?? undefined,
          jours,
        });
        // Horodaté même si le SMTP est absent : on ne veut pas boucler
        // indéfiniment sur les mêmes prospects.
        await this.prisma.prospect.update({
          where: { id: p.id },
          data: { [champ]: new Date() },
        });
        envoyes += 1;
      } catch (err) {
        this.logger.warn(
          `[relance-prospect-J+${jours}] échec pour ${p.email} : ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(
      `[relance-prospect-J+${jours}] ${envoyes}/${prospects.length} relance(s) traitée(s)`,
    );
  }

  // ============================================================
  // Fin d'essai (J-7, J-1) et expiration
  // ============================================================

  /** Tous les jours à 08 h 00 (heure du serveur). */
  @Cron(CronExpression.EVERY_DAY_AT_8AM, { name: 'fin-essai' })
  async surveillerFinsEssai(): Promise<void> {
    await this.alerterFinEssai(7);
    await this.alerterFinEssai(1);
    await this.expirerEssais();
  }

  private async alerterFinEssai(joursRestants: 7 | 1): Promise<void> {
    const champ = joursRestants === 7 ? 'relanceEssaiJ7EnvoyeeLe' : 'relanceEssaiJ1EnvoyeeLe';

    const debut = new Date();
    debut.setHours(0, 0, 0, 0);
    debut.setDate(debut.getDate() + joursRestants);
    const fin = new Date(debut);
    fin.setDate(fin.getDate() + 1);

    let organisations: Array<{ id: string; nom: string; dateFinEssai: Date | null }> = [];

    try {
      organisations = await this.prisma.organisation.findMany({
        where: {
          actif: true,
          statutAbonnement: StatutAbonnement.ESSAI,
          dateFinEssai: { gte: debut, lt: fin },
          [champ]: null,
        },
        select: { id: true, nom: true, dateFinEssai: true },
        take: 500,
      });
    } catch (err) {
      this.logger.error(`[fin-essai-J-${joursRestants}] lecture impossible : ${(err as Error).message}`);
      return;
    }

    if (organisations.length === 0) {
      this.logger.debug(`[fin-essai-J-${joursRestants}] aucune organisation concernée`);
      return;
    }

    let traitees = 0;
    for (const org of organisations) {
      try {
        const destinataires = await this.administrateurs(org.id);
        for (const dest of destinataires) {
          await this.email.sendFinEssaiProche(dest.email, {
            nom: dest.nom,
            organisationNom: org.nom,
            joursRestants,
            dateFin: org.dateFinEssai ?? undefined,
          });
        }
        await this.prisma.organisation.update({
          where: { id: org.id },
          data: { [champ]: new Date() },
        });
        traitees += 1;
      } catch (err) {
        this.logger.warn(
          `[fin-essai-J-${joursRestants}] échec pour l'organisation ${org.id} : ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(
      `[fin-essai-J-${joursRestants}] ${traitees}/${organisations.length} organisation(s) traitée(s)`,
    );
  }

  /** Bascule en EXPIRE les essais échus + email d'expiration (une seule fois). */
  private async expirerEssais(): Promise<void> {
    const maintenant = new Date();

    let organisations: Array<{ id: string; nom: string }> = [];

    try {
      organisations = await this.prisma.organisation.findMany({
        where: {
          statutAbonnement: StatutAbonnement.ESSAI,
          dateFinEssai: { lt: maintenant },
        },
        select: { id: true, nom: true },
        take: 500,
      });
    } catch (err) {
      this.logger.error(`[essai-expire] lecture impossible : ${(err as Error).message}`);
      return;
    }

    if (organisations.length === 0) {
      this.logger.debug('[essai-expire] aucun essai échu');
      return;
    }

    let traitees = 0;
    for (const org of organisations) {
      try {
        // Le changement de statut rend le job idempotent : à la prochaine
        // exécution l'organisation ne fait plus partie de la sélection.
        await this.prisma.organisation.update({
          where: { id: org.id },
          data: { statutAbonnement: StatutAbonnement.EXPIRE },
        });

        const destinataires = await this.administrateurs(org.id);
        for (const dest of destinataires) {
          await this.email.sendEssaiExpire(dest.email, {
            nom: dest.nom,
            organisationNom: org.nom,
          });
        }
        traitees += 1;
      } catch (err) {
        this.logger.warn(
          `[essai-expire] échec pour l'organisation ${org.id} : ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(`[essai-expire] ${traitees}/${organisations.length} essai(s) expiré(s)`);
  }

  /** Administrateurs actifs d'une organisation (destinataires des alertes d'abonnement). */
  private async administrateurs(
    organisationId: string,
  ): Promise<Array<{ email: string; nom: string }>> {
    const liens = await this.prisma.utilisateurOrganisation.findMany({
      where: {
        organisationId,
        actif: true,
        role: { in: [RoleUtilisateur.SUPER_ADMIN, RoleUtilisateur.ADMIN_ORGANISATION] },
      },
      select: { utilisateur: { select: { email: true, nom: true, prenom: true, actif: true } } },
    });

    return liens
      .map((l) => l.utilisateur)
      .filter((u): u is NonNullable<typeof u> => Boolean(u?.actif && u?.email))
      .map((u) => ({
        email: u.email,
        nom: [u.prenom, u.nom].filter(Boolean).join(' ') || u.nom,
      }));
  }
}
