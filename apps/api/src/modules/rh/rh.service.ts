import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEmployeDto } from './dto/create-employe.dto';
import { GenererFichePaieDto } from './dto/generer-fiche-paie.dto';
import { DemanderCongeDto } from './dto/demander-conge.dto';
import { CreateVolontaireDto } from './dto/create-volontaire.dto';

@Injectable()
export class RhService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllEmployes(
    organisationId: string,
    params: { page?: number; limit?: number; search?: string; actif?: boolean },
  ) {
    const { page = 1, limit = 20, search, actif } = params;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { organisationId };

    if (actif !== undefined) where['actif'] = actif;

    if (search) {
      where['OR'] = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { matricule: { contains: search, mode: 'insensitive' } },
        { poste: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.employe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employe.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneEmploye(id: string, organisationId: string) {
    const employe = await this.prisma.employe.findFirst({
      where: { id, organisationId },
      include: {
        fiches: { orderBy: { createdAt: 'desc' }, take: 12 },
        conges: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!employe) throw new NotFoundException(`Employé ${id} introuvable`);
    return employe;
  }

  async createEmploye(organisationId: string, dto: CreateEmployeDto) {
    if (dto.matricule) {
      const exists = await this.prisma.employe.findUnique({
        where: { organisationId_matricule: { organisationId, matricule: dto.matricule } },
      });
      if (exists) {
        throw new BadRequestException(`Le matricule ${dto.matricule} existe déjà`);
      }
    } else {
      const count = await this.prisma.employe.count({ where: { organisationId } });
      dto.matricule = `EMP-${String(count + 1).padStart(5, '0')}`;
    }

    return this.prisma.employe.create({
      data: {
        ...dto,
        organisationId,
        dateEmbauche: new Date(dto.dateEmbauche),
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
        dateFinContrat: dto.dateFinContrat ? new Date(dto.dateFinContrat) : undefined,
      } as any,
    });
  }

  async updateEmploye(id: string, organisationId: string, dto: Partial<CreateEmployeDto>) {
    await this.findOneEmploye(id, organisationId);

    return this.prisma.employe.update({
      where: { id },
      data: {
        ...dto,
        dateEmbauche: dto.dateEmbauche ? new Date(dto.dateEmbauche) : undefined,
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
        dateFinContrat: dto.dateFinContrat ? new Date(dto.dateFinContrat) : undefined,
      } as any,
    });
  }

  async deleteEmploye(id: string, organisationId: string) {
    await this.findOneEmploye(id, organisationId);
    await this.prisma.employe.delete({ where: { id } });
    return { message: 'Employé supprimé avec succès' };
  }

  async getFichesPaie(employeId: string) {
    const employe = await this.prisma.employe.findUnique({ where: { id: employeId } });
    if (!employe) throw new NotFoundException(`Employé ${employeId} introuvable`);

    return this.prisma.fichePaie.findMany({
      where: { employeId },
      orderBy: { periode: 'desc' },
    });
  }

  async genererFichePaie(employeId: string, periode: string, dto: GenererFichePaieDto) {
    const employe = await this.prisma.employe.findUnique({ where: { id: employeId } });
    if (!employe) throw new NotFoundException(`Employé ${employeId} introuvable`);

    const existing = await this.prisma.fichePaie.findUnique({
      where: { employeId_periode: { employeId, periode } },
    });
    if (existing) {
      throw new BadRequestException(`Une fiche de paie pour la période ${periode} existe déjà`);
    }

    const salaireBase = Number(employe.salaireBase ?? 0);
    const primes = dto.primes ?? 0;
    const deductions = dto.deductions ?? 0;
    const cotisationsSociales = dto.cotisationsSociales ?? 0;
    const impots = dto.impots ?? 0;

    const salaireBrut = salaireBase + primes - deductions;
    const salaireNet = salaireBrut - cotisationsSociales - impots;

    return this.prisma.fichePaie.create({
      data: {
        employeId,
        periode,
        salaireBase,
        primes,
        deductions,
        salaireBrut,
        cotisationsSociales,
        impots,
        salaireNet,
        datePaiement: dto.datePaiement ? new Date(dto.datePaiement) : undefined,
        statut: 'BROUILLON',
      },
    });
  }

  async validerFichePaie(id: string) {
    const fiche = await this.prisma.fichePaie.findUnique({ where: { id } });
    if (!fiche) throw new NotFoundException(`Fiche de paie ${id} introuvable`);
    if (fiche.statut === 'VALIDE') {
      throw new BadRequestException('Cette fiche de paie est déjà validée');
    }

    return this.prisma.fichePaie.update({
      where: { id },
      data: { statut: 'VALIDE' },
    });
  }

  async getConges(employeId: string) {
    const employe = await this.prisma.employe.findUnique({ where: { id: employeId } });
    if (!employe) throw new NotFoundException(`Employé ${employeId} introuvable`);

    return this.prisma.conge.findMany({
      where: { employeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async demanderConge(employeId: string, dto: DemanderCongeDto) {
    const employe = await this.prisma.employe.findUnique({ where: { id: employeId } });
    if (!employe) throw new NotFoundException(`Employé ${employeId} introuvable`);

    return this.prisma.conge.create({
      data: {
        employeId,
        type: dto.type,
        dateDebut: new Date(dto.dateDebut),
        dateFin: new Date(dto.dateFin),
        nombreJours: dto.nombreJours,
        motif: dto.motif,
        statut: 'EN_ATTENTE',
      },
    });
  }

  async approuverConge(id: string) {
    const conge = await this.prisma.conge.findUnique({ where: { id } });
    if (!conge) throw new NotFoundException(`Congé ${id} introuvable`);
    if (conge.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Ce congé ne peut plus être approuvé');
    }

    return this.prisma.conge.update({ where: { id }, data: { statut: 'APPROUVE' } });
  }

  async rejeterConge(id: string) {
    const conge = await this.prisma.conge.findUnique({ where: { id } });
    if (!conge) throw new NotFoundException(`Congé ${id} introuvable`);
    if (conge.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Ce congé ne peut plus être rejeté');
    }

    return this.prisma.conge.update({ where: { id }, data: { statut: 'REJETE' } });
  }

  async findAllVolontaires(
    organisationId: string,
    params: { page?: number; limit?: number; search?: string },
  ) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { organisationId };

    if (search) {
      where['OR'] = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.volontaire.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.volontaire.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createVolontaire(organisationId: string, dto: CreateVolontaireDto) {
    return this.prisma.volontaire.create({ data: { ...dto, organisationId } as any });
  }

  async getStats(organisationId: string) {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalEmployes, enConge, totalVolontaires, fiches] = await Promise.all([
      this.prisma.employe.count({ where: { organisationId, actif: true } }),
      this.prisma.conge.count({
        where: {
          employe: { organisationId },
          statut: 'APPROUVE',
          dateDebut: { lte: now },
          dateFin: { gte: now },
        },
      }),
      this.prisma.volontaire.count({ where: { organisationId, actif: true } }),
      this.prisma.fichePaie.findMany({
        where: {
          employe: { organisationId },
          periode: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
          statut: 'VALIDE',
        },
        select: { salaireNet: true },
      }),
    ]);

    const masseSalariale = fiches.reduce((sum, f) => sum + Number(f.salaireNet), 0);

    return { totalEmployes, enConge, totalVolontaires, masseSalariale };
  }
}
