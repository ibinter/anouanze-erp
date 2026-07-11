import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateImmobilisationDto } from './dto/create-immobilisation.dto';
import { CederImmobilisationDto } from './dto/ceder-immobilisation.dto';

@Injectable()
export class ImmobilisationsService {
  constructor(private readonly prisma: PrismaService) {}

  private calculerAmortissementsCumules(
    valeurAcquisition: number,
    dureeVie: number | null,
    tauxAmortissement: number | null,
    dateAcquisition: Date,
    dateReference: Date,
  ): number {
    const moisEcoules = Math.max(
      0,
      (dateReference.getFullYear() - dateAcquisition.getFullYear()) * 12 +
        (dateReference.getMonth() - dateAcquisition.getMonth()),
    );

    let taux: number;
    if (tauxAmortissement) {
      taux = Number(tauxAmortissement) / 100;
    } else if (dureeVie) {
      taux = 1 / (dureeVie / 12);
    } else {
      return 0;
    }

    const anneesEcoulees = moisEcoules / 12;
    return Math.min(valeurAcquisition, valeurAcquisition * taux * anneesEcoulees);
  }

  async findAll(orgId: string, params: { page?: number; limit?: number; categorie?: string; statut?: string }) {
    const { page = 1, limit = 20, categorie, statut } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { organisationId: orgId };
    if (categorie) where['categorie'] = categorie;
    if (statut) where['statut'] = statut;

    const [data, total] = await Promise.all([
      this.prisma.immobilisation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateAcquisition: 'desc' },
      }),
      this.prisma.immobilisation.count({ where }),
    ]);

    const now = new Date();
    const enriched = data.map((immo) => {
      const valeurAcquisition = Number(immo.valeurAcquisition);
      const amortissementsCumules = this.calculerAmortissementsCumules(
        valeurAcquisition,
        immo.dureeVie,
        immo.tauxAmortissement ? Number(immo.tauxAmortissement) : null,
        immo.dateAcquisition,
        now,
      );
      return {
        ...immo,
        valeurAcquisition,
        amortissementsCumules: Math.round(amortissementsCumules),
        valeurNette: Math.round(Math.max(0, valeurAcquisition - amortissementsCumules)),
      };
    });

    return { data: enriched, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, orgId: string) {
    const immo = await this.prisma.immobilisation.findFirst({
      where: { id, organisationId: orgId },
    });
    if (!immo) throw new NotFoundException(`Immobilisation ${id} introuvable`);

    const valeurAcquisition = Number(immo.valeurAcquisition);
    const now = new Date();
    const amortissementsCumules = this.calculerAmortissementsCumules(
      valeurAcquisition,
      immo.dureeVie,
      immo.tauxAmortissement ? Number(immo.tauxAmortissement) : null,
      immo.dateAcquisition,
      now,
    );

    return {
      ...immo,
      valeurAcquisition,
      amortissementsCumules: Math.round(amortissementsCumules),
      valeurNette: Math.round(Math.max(0, valeurAcquisition - amortissementsCumules)),
    };
  }

  async create(orgId: string, dto: CreateImmobilisationDto) {
    const exists = await this.prisma.immobilisation.findUnique({
      where: { organisationId_reference: { organisationId: orgId, reference: dto.reference } },
    });
    if (exists) throw new BadRequestException(`La référence ${dto.reference} est déjà utilisée`);

    return this.prisma.immobilisation.create({
      data: {
        ...dto,
        organisationId: orgId,
        dateAcquisition: new Date(dto.dateAcquisition),
        statut: 'EN_SERVICE',
      },
    });
  }

  async update(id: string, orgId: string, dto: Partial<CreateImmobilisationDto>) {
    await this.findOne(id, orgId);
    const data: Record<string, unknown> = { ...dto };
    if (dto.dateAcquisition) data['dateAcquisition'] = new Date(dto.dateAcquisition);
    return this.prisma.immobilisation.update({ where: { id }, data });
  }

  async ceder(id: string, orgId: string, dto: CederImmobilisationDto) {
    const immo = await this.findOne(id, orgId);
    if (immo.statut === 'CEDE') throw new BadRequestException('Cette immobilisation a déjà été cédée');

    const prixCession = dto.prixCession;
    const valeurNette = immo.valeurNette;
    const plusMoinsValue = prixCession - valeurNette;

    await this.prisma.immobilisation.update({
      where: { id },
      data: { statut: 'CEDE' },
    });

    return {
      immobilisation: immo,
      cession: {
        dateCession: dto.dateCession,
        prixCession,
        acquereur: dto.acquereur,
        valeurNette,
        plusMoinsValue,
        type: plusMoinsValue >= 0 ? 'PLUS_VALUE' : 'MOINS_VALUE',
      },
    };
  }

  async calculerAmortissements(orgId: string, periode: string) {
    const [annee, mois] = periode.split('-').map(Number);
    const dateDebut = new Date(annee, mois - 1, 1);
    const dateFin = new Date(annee, mois, 0);

    const immobilisations = await this.prisma.immobilisation.findMany({
      where: { organisationId: orgId, statut: 'EN_SERVICE', dateAcquisition: { lte: dateFin } },
    });

    const ecritures = immobilisations
      .map((immo) => {
        const valeurAcquisition = Number(immo.valeurAcquisition);
        let tauxAnnuel: number;

        if (immo.tauxAmortissement) {
          tauxAnnuel = Number(immo.tauxAmortissement) / 100;
        } else if (immo.dureeVie) {
          tauxAnnuel = 1 / (immo.dureeVie / 12);
        } else {
          return null;
        }

        const dotationMensuelle = Math.round((valeurAcquisition * tauxAnnuel) / 12);
        if (dotationMensuelle <= 0) return null;

        return {
          immobilisationId: immo.id,
          designation: immo.designation,
          reference: immo.reference,
          dotationMensuelle,
          compteCharge: '68100',
          compteAmortissement: `28${immo.categorie === 'INFORMATIQUE' ? '45' : immo.categorie === 'VEHICULE' ? '44' : '10'}`,
          libelle: `Amortissement ${immo.designation} — ${periode}`,
        };
      })
      .filter(Boolean);

    const totalDotations = ecritures.reduce((sum, e) => sum + (e?.dotationMensuelle ?? 0), 0);

    return {
      periode,
      totalImmobilisations: immobilisations.length,
      totalDotations,
      ecritures,
    };
  }

  async getStats(orgId: string) {
    const immobilisations = await this.prisma.immobilisation.findMany({
      where: { organisationId: orgId },
    });

    const now = new Date();
    let valeurBrute = 0;
    let valeurNette = 0;
    let amortissementsMois = 0;

    for (const immo of immobilisations) {
      const va = Number(immo.valeurAcquisition);
      valeurBrute += va;

      const cumules = this.calculerAmortissementsCumules(
        va,
        immo.dureeVie,
        immo.tauxAmortissement ? Number(immo.tauxAmortissement) : null,
        immo.dateAcquisition,
        now,
      );
      valeurNette += Math.max(0, va - cumules);

      if (immo.statut === 'EN_SERVICE') {
        let tauxAnnuel = 0;
        if (immo.tauxAmortissement) tauxAnnuel = Number(immo.tauxAmortissement) / 100;
        else if (immo.dureeVie) tauxAnnuel = 1 / (immo.dureeVie / 12);
        amortissementsMois += Math.round((va * tauxAnnuel) / 12);
      }
    }

    return {
      total: immobilisations.length,
      enService: immobilisations.filter((i) => i.statut === 'EN_SERVICE').length,
      valeurBrute: Math.round(valeurBrute),
      valeurNette: Math.round(valeurNette),
      amortissementsCumules: Math.round(valeurBrute - valeurNette),
      amortissementsMois,
    };
  }
}
