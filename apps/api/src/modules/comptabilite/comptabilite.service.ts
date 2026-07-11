import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCompteDto } from './dto/create-compte.dto';
import { CreateJournalDto } from './dto/create-journal.dto';
import { CreateEcritureDto } from './dto/create-ecriture.dto';
import { TypeCompte } from '@prisma/client';

const PLAN_COMPTABLE_SYCEBNL = [
  { numero: '1', nom: 'Fonds propres et emprunts', typeCompte: TypeCompte.CLASSE_1, sens: 'CREDITEUR' },
  { numero: '10', nom: 'Capital et réserves', typeCompte: TypeCompte.CLASSE_1, sens: 'CREDITEUR' },
  { numero: '101', nom: 'Dotation initiale', typeCompte: TypeCompte.CLASSE_1, sens: 'CREDITEUR' },
  { numero: '105', nom: 'Réserves', typeCompte: TypeCompte.CLASSE_1, sens: 'CREDITEUR' },
  { numero: '11', nom: 'Report à nouveau', typeCompte: TypeCompte.CLASSE_1, sens: 'CREDITEUR' },
  { numero: '12', nom: 'Résultat de l\'exercice', typeCompte: TypeCompte.CLASSE_1, sens: 'CREDITEUR' },
  { numero: '16', nom: 'Emprunts et dettes assimilées', typeCompte: TypeCompte.CLASSE_1, sens: 'CREDITEUR' },
  { numero: '2', nom: 'Immobilisations', typeCompte: TypeCompte.CLASSE_2, sens: 'DEBITEUR' },
  { numero: '21', nom: 'Immobilisations incorporelles', typeCompte: TypeCompte.CLASSE_2, sens: 'DEBITEUR' },
  { numero: '22', nom: 'Terrains', typeCompte: TypeCompte.CLASSE_2, sens: 'DEBITEUR' },
  { numero: '23', nom: 'Bâtiments', typeCompte: TypeCompte.CLASSE_2, sens: 'DEBITEUR' },
  { numero: '24', nom: 'Matériel et outillage', typeCompte: TypeCompte.CLASSE_2, sens: 'DEBITEUR' },
  { numero: '25', nom: 'Matériel de transport', typeCompte: TypeCompte.CLASSE_2, sens: 'DEBITEUR' },
  { numero: '26', nom: 'Matériel de bureau et informatique', typeCompte: TypeCompte.CLASSE_2, sens: 'DEBITEUR' },
  { numero: '28', nom: 'Amortissements', typeCompte: TypeCompte.CLASSE_2, sens: 'CREDITEUR' },
  { numero: '3', nom: 'Stocks', typeCompte: TypeCompte.CLASSE_3, sens: 'DEBITEUR' },
  { numero: '31', nom: 'Stocks de marchandises', typeCompte: TypeCompte.CLASSE_3, sens: 'DEBITEUR' },
  { numero: '32', nom: 'Stocks de matières et fournitures', typeCompte: TypeCompte.CLASSE_3, sens: 'DEBITEUR' },
  { numero: '4', nom: 'Tiers', typeCompte: TypeCompte.CLASSE_4, sens: 'DEBITEUR' },
  { numero: '40', nom: 'Fournisseurs et comptes rattachés', typeCompte: TypeCompte.CLASSE_4, sens: 'CREDITEUR' },
  { numero: '41', nom: 'Clients et comptes rattachés', typeCompte: TypeCompte.CLASSE_4, sens: 'DEBITEUR' },
  { numero: '42', nom: 'Personnel et comptes rattachés', typeCompte: TypeCompte.CLASSE_4, sens: 'CREDITEUR' },
  { numero: '43', nom: 'Organismes sociaux', typeCompte: TypeCompte.CLASSE_4, sens: 'CREDITEUR' },
  { numero: '44', nom: 'État et collectivités publiques', typeCompte: TypeCompte.CLASSE_4, sens: 'CREDITEUR' },
  { numero: '46', nom: 'Débiteurs et créditeurs divers', typeCompte: TypeCompte.CLASSE_4, sens: 'DEBITEUR' },
  { numero: '47', nom: 'Compte d\'attente et à régulariser', typeCompte: TypeCompte.CLASSE_4, sens: 'DEBITEUR' },
  { numero: '5', nom: 'Trésorerie', typeCompte: TypeCompte.CLASSE_5, sens: 'DEBITEUR' },
  { numero: '51', nom: 'Banques et établissements financiers', typeCompte: TypeCompte.CLASSE_5, sens: 'DEBITEUR' },
  { numero: '52', nom: 'Chèques postaux', typeCompte: TypeCompte.CLASSE_5, sens: 'DEBITEUR' },
  { numero: '57', nom: 'Caisse', typeCompte: TypeCompte.CLASSE_5, sens: 'DEBITEUR' },
  { numero: '6', nom: 'Charges', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
  { numero: '60', nom: 'Achats et variations de stocks', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
  { numero: '61', nom: 'Services extérieurs', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
  { numero: '62', nom: 'Autres services extérieurs', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
  { numero: '63', nom: 'Impôts et taxes', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
  { numero: '64', nom: 'Charges de personnel', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
  { numero: '65', nom: 'Autres charges de gestion courante', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
  { numero: '66', nom: 'Charges financières', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
  { numero: '68', nom: 'Dotations aux amortissements et provisions', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
  { numero: '7', nom: 'Produits', typeCompte: TypeCompte.CLASSE_7, sens: 'CREDITEUR' },
  { numero: '70', nom: 'Ressources propres et cotisations', typeCompte: TypeCompte.CLASSE_7, sens: 'CREDITEUR' },
  { numero: '71', nom: 'Subventions et dons reçus', typeCompte: TypeCompte.CLASSE_7, sens: 'CREDITEUR' },
  { numero: '72', nom: 'Produits de la vente de biens et services', typeCompte: TypeCompte.CLASSE_7, sens: 'CREDITEUR' },
  { numero: '75', nom: 'Autres produits de gestion courante', typeCompte: TypeCompte.CLASSE_7, sens: 'CREDITEUR' },
  { numero: '76', nom: 'Produits financiers', typeCompte: TypeCompte.CLASSE_7, sens: 'CREDITEUR' },
  { numero: '77', nom: 'Produits exceptionnels', typeCompte: TypeCompte.CLASSE_7, sens: 'CREDITEUR' },
];

@Injectable()
export class ComptabiliteService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlanComptable(organisationId: string) {
    const comptes = await this.prisma.compteComptable.findMany({
      where: { organisationId },
      include: { sousComptes: true },
      orderBy: { numero: 'asc' },
    });

    return comptes.filter((c) => !c.compteParentId);
  }

  async createCompte(organisationId: string, dto: CreateCompteDto) {
    const exists = await this.prisma.compteComptable.findUnique({
      where: { organisationId_numero: { organisationId, numero: dto.numero } },
    });

    if (exists) {
      throw new BadRequestException(`Le compte ${dto.numero} existe déjà`);
    }

    if (dto.compteParentId) {
      const parent = await this.prisma.compteComptable.findFirst({
        where: { id: dto.compteParentId, organisationId },
      });
      if (!parent) throw new NotFoundException(`Compte parent introuvable`);
    }

    return this.prisma.compteComptable.create({
      data: { ...dto, organisationId },
    });
  }

  async getJournaux(organisationId: string) {
    return this.prisma.journal.findMany({
      where: { organisationId },
      orderBy: { code: 'asc' },
    });
  }

  async createJournal(organisationId: string, dto: CreateJournalDto) {
    const exists = await this.prisma.journal.findUnique({
      where: { organisationId_code: { organisationId, code: dto.code } },
    });

    if (exists) {
      throw new BadRequestException(`Le journal ${dto.code} existe déjà`);
    }

    return this.prisma.journal.create({
      data: { ...dto, organisationId },
    });
  }

  async createEcriture(organisationId: string, dto: CreateEcritureDto) {
    const totalDebit = dto.lignes.reduce((sum, l) => sum + Number(l.debit), 0);
    const totalCredit = dto.lignes.reduce((sum, l) => sum + Number(l.credit), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new BadRequestException(
        `L'écriture est déséquilibrée : débit=${totalDebit}, crédit=${totalCredit}`,
      );
    }

    if (dto.lignes.length < 2) {
      throw new BadRequestException('Une écriture doit avoir au moins 2 lignes');
    }

    const journal = await this.prisma.journal.findFirst({
      where: { id: dto.journalId, organisationId },
    });

    if (!journal) throw new NotFoundException(`Journal ${dto.journalId} introuvable`);

    const count = await this.prisma.ecritureComptable.count({
      where: { organisationId, journalId: dto.journalId },
    });
    const numero = `${journal.code}-${String(count + 1).padStart(6, '0')}`;

    return this.prisma.ecritureComptable.create({
      data: {
        organisationId,
        journalId: dto.journalId,
        projetId: dto.projetId,
        numero,
        libelle: dto.libelle,
        dateEcriture: new Date(dto.dateEcriture),
        dateValeur: dto.dateValeur ? new Date(dto.dateValeur) : undefined,
        exercice: dto.exercice,
        periode: dto.periode,
        totalDebit,
        totalCredit,
        pieceJointe: dto.pieceJointe,
        lignes: {
          create: dto.lignes.map((l, i) => ({
            compteId: l.compteId,
            libelle: l.libelle,
            debit: l.debit,
            credit: l.credit,
            ordre: i + 1,
          })),
        },
      },
      include: { lignes: true, journal: true },
    });
  }

  async validerEcriture(ecritureId: string, organisationId: string) {
    const ecriture = await this.prisma.ecritureComptable.findFirst({
      where: { id: ecritureId, organisationId },
    });

    if (!ecriture) throw new NotFoundException(`Écriture ${ecritureId} introuvable`);
    if (ecriture.valide) throw new BadRequestException('Cette écriture est déjà validée');

    return this.prisma.ecritureComptable.update({
      where: { id: ecritureId },
      data: { valide: true, dateValidation: new Date() },
    });
  }

  async getEcritures(
    organisationId: string,
    params: {
      page?: number;
      limit?: number;
      journalId?: string;
      projetId?: string;
      exercice?: number;
      periodeDebut?: string;
      periodeFin?: string;
    },
  ) {
    const { page = 1, limit = 20, journalId, projetId, exercice, periodeDebut, periodeFin } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { organisationId };

    if (journalId) where['journalId'] = journalId;
    if (projetId) where['projetId'] = projetId;
    if (exercice) where['exercice'] = exercice;
    if (periodeDebut || periodeFin) {
      where['periode'] = {};
      if (periodeDebut) (where['periode'] as Record<string, string>)['gte'] = periodeDebut;
      if (periodeFin) (where['periode'] as Record<string, string>)['lte'] = periodeFin;
    }

    const [data, total] = await Promise.all([
      this.prisma.ecritureComptable.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateEcriture: 'desc' },
        include: { journal: true, lignes: { include: { compte: true } } },
      }),
      this.prisma.ecritureComptable.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBalance(organisationId: string, exercice: number) {
    const comptes = await this.prisma.compteComptable.findMany({
      where: { organisationId, actif: true },
      include: {
        lignesEcriture: {
          where: { ecriture: { organisationId, exercice } },
          select: { debit: true, credit: true },
        },
      },
      orderBy: { numero: 'asc' },
    });

    return comptes.map((compte) => {
      const totalDebit = compte.lignesEcriture.reduce((s, l) => s + Number(l.debit), 0);
      const totalCredit = compte.lignesEcriture.reduce((s, l) => s + Number(l.credit), 0);
      const solde = totalDebit - totalCredit;

      return {
        id: compte.id,
        numero: compte.numero,
        nom: compte.nom,
        typeCompte: compte.typeCompte,
        sens: compte.sens,
        totalDebit,
        totalCredit,
        soldeDebiteur: solde > 0 ? solde : 0,
        soldeCrediteur: solde < 0 ? Math.abs(solde) : 0,
      };
    });
  }

  async getGrandLivre(
    organisationId: string,
    compteId: string,
    params: { exercice?: number; periodeDebut?: string; periodeFin?: string },
  ) {
    const compte = await this.prisma.compteComptable.findFirst({
      where: { id: compteId, organisationId },
    });

    if (!compte) throw new NotFoundException(`Compte ${compteId} introuvable`);

    const ecritureWhere: Record<string, unknown> = { organisationId };
    if (params.exercice) ecritureWhere['exercice'] = params.exercice;

    const lignes = await this.prisma.ligneEcriture.findMany({
      where: {
        compteId,
        ecriture: ecritureWhere,
      },
      include: {
        ecriture: { include: { journal: true } },
      },
      orderBy: { ecriture: { dateEcriture: 'asc' } },
    });

    let soldeCumulatif = 0;
    const mouvements = lignes.map((l) => {
      soldeCumulatif += Number(l.debit) - Number(l.credit);
      return {
        id: l.id,
        date: l.ecriture.dateEcriture,
        journal: l.ecriture.journal.code,
        numero: l.ecriture.numero,
        libelle: l.libelle ?? l.ecriture.libelle,
        debit: Number(l.debit),
        credit: Number(l.credit),
        solde: soldeCumulatif,
      };
    });

    return { compte, mouvements };
  }

  async initPlanComptableSYCEBNL(organisationId: string) {
    const existing = await this.prisma.compteComptable.count({ where: { organisationId } });

    if (existing > 0) {
      throw new BadRequestException('Un plan comptable existe déjà pour cette organisation');
    }

    const comptes: Record<string, string> = {};

    for (const compte of PLAN_COMPTABLE_SYCEBNL) {
      const parentNumero = compte.numero.length > 1 ? compte.numero.slice(0, -1) : null;
      const compteParentId = parentNumero && comptes[parentNumero] ? comptes[parentNumero] : undefined;

      const created = await this.prisma.compteComptable.create({
        data: {
          organisationId,
          numero: compte.numero,
          nom: compte.nom,
          typeCompte: compte.typeCompte,
          sens: compte.sens,
          compteParentId,
        },
      });

      comptes[compte.numero] = created.id;
    }

    return { message: 'Plan comptable SYCEBNL initialisé', comptes: Object.keys(comptes).length };
  }
}
