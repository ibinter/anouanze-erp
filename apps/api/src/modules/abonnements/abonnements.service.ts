import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PeriodiciteAbonnement, StatutAbonnement, StatutFacture } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import {
  ChangerPlanDto,
  ChangerStatutFactureDto,
  GenererFactureDto,
  UpdateAbonnementDto,
} from './dto/abonnement.dto';

/** Convertit un Decimal Prisma en nombre exploitable côté calculs. */
function nombre(v: Prisma.Decimal | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  return typeof v === 'number' ? v : Number(v.toString());
}

@Injectable()
export class AbonnementsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────── PLANS ───────────────────────────

  listerPlans(inclureInactifs = false) {
    return this.prisma.plan.findMany({
      where: inclureInactifs ? {} : { actif: true },
      orderBy: { ordre: 'asc' },
    });
  }

  async creerPlan(dto: CreatePlanDto) {
    const code = dto.code.trim().toUpperCase();
    const existant = await this.prisma.plan.findUnique({ where: { code } });
    if (existant) throw new ConflictException(`Le plan ${code} existe déjà`);

    return this.prisma.plan.create({
      data: {
        code,
        nom: dto.nom,
        description: dto.description,
        prixMensuel: new Prisma.Decimal(dto.prixMensuel),
        prixAnnuel: new Prisma.Decimal(dto.prixAnnuel),
        maxUtilisateurs: dto.maxUtilisateurs ?? null,
        modulesInclus: dto.modulesInclus ?? [],
        surDevis: dto.surDevis ?? false,
        ordre: dto.ordre ?? 0,
        actif: dto.actif ?? true,
      },
    });
  }

  async modifierPlan(id: string, dto: UpdatePlanDto) {
    await this.getPlan(id);
    return this.prisma.plan.update({
      where: { id },
      data: {
        ...(dto.code !== undefined ? { code: dto.code.trim().toUpperCase() } : {}),
        ...(dto.nom !== undefined ? { nom: dto.nom } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.prixMensuel !== undefined
          ? { prixMensuel: new Prisma.Decimal(dto.prixMensuel) }
          : {}),
        ...(dto.prixAnnuel !== undefined
          ? { prixAnnuel: new Prisma.Decimal(dto.prixAnnuel) }
          : {}),
        ...(dto.maxUtilisateurs !== undefined ? { maxUtilisateurs: dto.maxUtilisateurs } : {}),
        ...(dto.modulesInclus !== undefined ? { modulesInclus: dto.modulesInclus } : {}),
        ...(dto.surDevis !== undefined ? { surDevis: dto.surDevis } : {}),
        ...(dto.ordre !== undefined ? { ordre: dto.ordre } : {}),
        ...(dto.actif !== undefined ? { actif: dto.actif } : {}),
      },
    });
  }

  async getPlan(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan introuvable');
    return plan;
  }

  /** Désactivation logique : un plan référencé par un abonnement n'est jamais supprimé. */
  async desactiverPlan(id: string) {
    await this.getPlan(id);
    return this.prisma.plan.update({ where: { id }, data: { actif: false } });
  }

  // ────────────────────── ABONNEMENT COURANT ──────────────────────

  /**
   * Abonnement courant d'une organisation + consommation réelle des sièges.
   * `organisationId` provient toujours du jeton côté contrôleur.
   */
  async abonnementCourant(organisationId?: string) {
    if (!organisationId) throw new BadRequestException('Organisation non résolue');

    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      select: {
        id: true,
        nom: true,
        statutAbonnement: true,
        dateDebutEssai: true,
        dateFinEssai: true,
        deviseDefaut: true,
      },
    });
    if (!organisation) throw new NotFoundException('Organisation introuvable');

    const abonnement = await this.prisma.abonnement.findFirst({
      where: { organisationId },
      include: { plan: true },
      orderBy: [{ statut: 'asc' }, { dateFin: 'desc' }],
    });

    const [utilisateursActifs, utilisateursTotal] = await Promise.all([
      this.prisma.utilisateurOrganisation.count({ where: { organisationId, actif: true } }),
      this.prisma.utilisateurOrganisation.count({ where: { organisationId } }),
    ]);

    return {
      organisation,
      abonnement,
      consommation: {
        utilisateursActifs,
        utilisateursTotal,
        utilisateursInclus: abonnement?.plan?.maxUtilisateurs ?? null, // null = illimité
      },
      prochaineEcheance: abonnement?.dateFin ?? organisation.dateFinEssai ?? null,
    };
  }

  listerFactures(organisationId?: string) {
    if (!organisationId) throw new BadRequestException('Organisation non résolue');
    return this.prisma.facture.findMany({
      where: { organisationId },
      include: { lignes: { orderBy: { ordre: 'asc' } } },
      orderBy: { dateEmission: 'desc' },
    });
  }

  async getFacture(id: string, organisationId?: string) {
    const facture = await this.prisma.facture.findUnique({
      where: { id },
      include: { lignes: { orderBy: { ordre: 'asc' } }, organisation: true, abonnement: { include: { plan: true } } },
    });
    if (!facture) throw new NotFoundException('Facture introuvable');
    // Cloisonnement : une organisation ne voit que ses propres factures.
    if (organisationId && facture.organisationId !== organisationId) {
      throw new NotFoundException('Facture introuvable');
    }
    return facture;
  }

  // ────────────────────── CHANGEMENT DE PLAN ──────────────────────

  async changerPlan(dto: ChangerPlanDto, organisationId?: string) {
    if (!organisationId) throw new BadRequestException('Organisation non résolue');

    const code = dto.codePlan.trim().toUpperCase();
    const plan = await this.prisma.plan.findUnique({ where: { code } });
    if (!plan) throw new NotFoundException(`Plan ${code} introuvable`);
    if (!plan.actif) throw new BadRequestException(`Le plan ${code} n'est plus commercialisé`);
    if (plan.surDevis) {
      throw new BadRequestException(
        `Le plan ${code} est proposé sur devis : il doit être activé par IBIG SOFT après signature.`,
      );
    }

    const periodicite = dto.periodicite ?? PeriodiciteAbonnement.MENSUELLE;
    const montant =
      periodicite === PeriodiciteAbonnement.ANNUELLE ? plan.prixAnnuel : plan.prixMensuel;

    const dateDebut = new Date();
    const dateFin = new Date(dateDebut);
    if (periodicite === PeriodiciteAbonnement.ANNUELLE) {
      dateFin.setFullYear(dateFin.getFullYear() + 1);
    } else {
      dateFin.setMonth(dateFin.getMonth() + 1);
    }

    // Le précédent abonnement actif est clos, l'historique est conservé.
    const precedent = await this.prisma.abonnement.findFirst({
      where: { organisationId, statut: StatutAbonnement.ACTIF },
    });

    return this.prisma.$transaction(async (tx) => {
      if (precedent) {
        await tx.abonnement.update({
          where: { id: precedent.id },
          data: { statut: StatutAbonnement.EXPIRE, dateFin: dateDebut },
        });
      }
      const abonnement = await tx.abonnement.create({
        data: {
          organisationId,
          planId: plan.id,
          periodicite,
          dateDebut,
          dateFin,
          statut: StatutAbonnement.ACTIF,
          montant,
          devise: plan.devise,
          renouvellementAuto: dto.renouvellementAuto ?? true,
        },
        include: { plan: true },
      });
      await tx.organisation.update({
        where: { id: organisationId },
        data: { statutAbonnement: StatutAbonnement.ACTIF },
      });
      return abonnement;
    });
  }

  async modifierAbonnement(id: string, dto: UpdateAbonnementDto) {
    const existant = await this.prisma.abonnement.findUnique({ where: { id } });
    if (!existant) throw new NotFoundException('Abonnement introuvable');

    const abonnement = await this.prisma.abonnement.update({
      where: { id },
      data: {
        ...(dto.statut !== undefined ? { statut: dto.statut } : {}),
        ...(dto.renouvellementAuto !== undefined
          ? { renouvellementAuto: dto.renouvellementAuto }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
      include: { plan: true },
    });

    if (dto.statut !== undefined) {
      await this.prisma.organisation.update({
        where: { id: abonnement.organisationId },
        data: { statutAbonnement: dto.statut },
      });
    }
    return abonnement;
  }

  // ────────────────────────── FACTURATION ──────────────────────────

  /**
   * Numérotation séquentielle annuelle : FAC-2026-00001.
   * Le compteur repart du plus grand numéro existant de l'année, ce qui reste
   * correct même si des factures ont été annulées.
   */
  private async prochainNumero(annee: number): Promise<string> {
    const prefixe = `FAC-${annee}-`;
    const derniere = await this.prisma.facture.findFirst({
      where: { numero: { startsWith: prefixe } },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });
    const dernierSeq = derniere ? Number.parseInt(derniere.numero.slice(prefixe.length), 10) : 0;
    const suivant = (Number.isFinite(dernierSeq) ? dernierSeq : 0) + 1;
    return `${prefixe}${String(suivant).padStart(5, '0')}`;
  }

  /** Génère la facture correspondant à une période d'abonnement. */
  async genererFacture(abonnementId: string, dto: GenererFactureDto = {}) {
    const abonnement = await this.prisma.abonnement.findUnique({
      where: { id: abonnementId },
      include: { plan: true, organisation: { select: { nom: true } } },
    });
    if (!abonnement) throw new NotFoundException('Abonnement introuvable');
    if (abonnement.plan.surDevis) {
      throw new BadRequestException(
        'Plan sur devis : la facture doit être établie manuellement par IBIG SOFT.',
      );
    }

    const montantHT = nombre(abonnement.montant);
    if (montantHT <= 0) throw new BadRequestException('Montant d\'abonnement nul : rien à facturer');

    const dateEmission = new Date();
    const dateEcheance = new Date(dateEmission);
    dateEcheance.setDate(dateEcheance.getDate() + (dto.delaiEcheanceJours ?? 30));

    const periode =
      abonnement.periodicite === PeriodiciteAbonnement.ANNUELLE ? 'annuel' : 'mensuel';
    const libelle = `Abonnement ANOUANZÊ ERP — formule ${abonnement.plan.nom} (${periode})`;

    // Boucle courte : protège d'une collision de numéro en cas d'appels concurrents.
    for (let tentative = 0; tentative < 5; tentative++) {
      const numero = await this.prochainNumero(dateEmission.getFullYear());
      try {
        return await this.prisma.facture.create({
          data: {
            numero,
            abonnementId: abonnement.id,
            organisationId: abonnement.organisationId,
            montantHT: new Prisma.Decimal(montantHT),
            tauxTva: new Prisma.Decimal(0),
            montantTTC: new Prisma.Decimal(montantHT),
            devise: abonnement.devise,
            statut: dto.emettre ? StatutFacture.EMISE : StatutFacture.BROUILLON,
            dateEmission,
            dateEcheance,
            lignes: {
              create: [
                {
                  libelle,
                  quantite: new Prisma.Decimal(1),
                  prixUnitaire: new Prisma.Decimal(montantHT),
                  montant: new Prisma.Decimal(montantHT),
                  ordre: 0,
                },
              ],
            },
          },
          include: { lignes: true },
        });
      } catch (e) {
        const conflitNumero =
          e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
        if (!conflitNumero) throw e;
      }
    }
    throw new ConflictException('Impossible d\'attribuer un numéro de facture');
  }

  async changerStatutFacture(id: string, dto: ChangerStatutFactureDto) {
    const facture = await this.prisma.facture.findUnique({ where: { id } });
    if (!facture) throw new NotFoundException('Facture introuvable');

    return this.prisma.facture.update({
      where: { id },
      data: {
        statut: dto.statut,
        ...(dto.modePaiement !== undefined ? { modePaiement: dto.modePaiement } : {}),
        datePaiement:
          dto.statut === StatutFacture.PAYEE ? (facture.datePaiement ?? new Date()) : null,
      },
      include: { lignes: true },
    });
  }

  // ─────────────────────── SUPERVISION (SUPER_ADMIN) ───────────────────────

  listerAbonnements() {
    return this.prisma.abonnement.findMany({
      include: {
        plan: true,
        organisation: {
          select: { id: true, nom: true, slug: true, statutAbonnement: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * MRR réel : somme des abonnements ACTIFS ramenés au mois
   * (les abonnements annuels sont divisés par 12). Aucune table de prix en dur.
   */
  async statistiques() {
    const [abonnements, organisationsTotal, essais, impayees] = await Promise.all([
      this.prisma.abonnement.findMany({
        where: { statut: StatutAbonnement.ACTIF },
        include: { plan: { select: { code: true, nom: true } } },
      }),
      this.prisma.organisation.count(),
      this.prisma.organisation.count({ where: { statutAbonnement: StatutAbonnement.ESSAI } }),
      this.prisma.facture.count({
        where: { statut: { in: [StatutFacture.EMISE, StatutFacture.EN_RETARD] } },
      }),
    ]);

    let mrr = 0;
    const parPlan: Record<string, { nom: string; abonnements: number; mrr: number }> = {};

    for (const a of abonnements) {
      const mensuel =
        a.periodicite === PeriodiciteAbonnement.ANNUELLE
          ? nombre(a.montant) / 12
          : nombre(a.montant);
      mrr += mensuel;
      const cle = a.plan.code;
      parPlan[cle] ??= { nom: a.plan.nom, abonnements: 0, mrr: 0 };
      parPlan[cle].abonnements += 1;
      parPlan[cle].mrr += mensuel;
    }

    return {
      mrr: Math.round(mrr),
      arr: Math.round(mrr * 12),
      abonnementsActifs: abonnements.length,
      organisationsTotal,
      organisationsEnEssai: essais,
      facturesImpayees: impayees,
      parPlan,
    };
  }
}
