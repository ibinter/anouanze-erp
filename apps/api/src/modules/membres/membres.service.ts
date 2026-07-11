import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMembreDto } from './dto/create-membre.dto';
import { CreateCotisationDto } from './dto/create-cotisation.dto';
import { StatutMembre, StatutPaiement } from '@prisma/client';

@Injectable()
export class MembresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organisationId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      statut?: StatutMembre;
    },
  ) {
    const { page = 1, limit = 20, search, statut } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { organisationId };

    if (statut) {
      where['statutMembre'] = statut;
    }

    if (search) {
      where['OR'] = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { numero: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.membre.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.membre.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, organisationId: string) {
    const membre = await this.prisma.membre.findFirst({
      where: { id, organisationId },
      include: { cotisations: { orderBy: { createdAt: 'desc' } } },
    });

    if (!membre) {
      throw new NotFoundException(`Membre ${id} introuvable`);
    }

    return membre;
  }

  async create(organisationId: string, dto: CreateMembreDto) {
    let numero = dto.numero;

    if (!numero) {
      const count = await this.prisma.membre.count({ where: { organisationId } });
      numero = `MBR-${String(count + 1).padStart(5, '0')}`;
    }

    const exists = await this.prisma.membre.findUnique({
      where: { organisationId_numero: { organisationId, numero } },
    });

    if (exists) {
      throw new BadRequestException(`Le numéro de membre ${numero} existe déjà`);
    }

    return this.prisma.membre.create({
      data: {
        ...dto,
        numero,
        organisationId,
        dateAdhesion: dto.dateAdhesion ? new Date(dto.dateAdhesion) : new Date(),
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
        dateExpiration: dto.dateExpiration ? new Date(dto.dateExpiration) : undefined,
      } as any,
    });
  }

  async update(id: string, organisationId: string, dto: Partial<CreateMembreDto>) {
    await this.findOne(id, organisationId);

    return this.prisma.membre.update({
      where: { id },
      data: {
        ...dto,
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
        dateExpiration: dto.dateExpiration ? new Date(dto.dateExpiration) : undefined,
        dateAdhesion: dto.dateAdhesion ? new Date(dto.dateAdhesion) : undefined,
      } as any,
    });
  }

  async delete(id: string, organisationId: string) {
    await this.findOne(id, organisationId);
    await this.prisma.membre.delete({ where: { id } });
    return { message: 'Membre supprimé avec succès' };
  }

  async getCotisations(membreId: string) {
    return this.prisma.cotisation.findMany({
      where: { membreId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCotisation(membreId: string, dto: CreateCotisationDto) {
    const membre = await this.prisma.membre.findUnique({ where: { id: membreId } });

    if (!membre) {
      throw new NotFoundException(`Membre ${membreId} introuvable`);
    }

    return this.prisma.cotisation.create({
      data: {
        ...dto,
        membreId,
        dateEcheance: new Date(dto.dateEcheance),
        datePaiement: dto.datePaiement ? new Date(dto.datePaiement) : undefined,
      },
    });
  }

  async getStats(organisationId: string) {
    const [total, actifs, inactifs, cotisations] = await Promise.all([
      this.prisma.membre.count({ where: { organisationId } }),
      this.prisma.membre.count({ where: { organisationId, statutMembre: StatutMembre.ACTIF } }),
      this.prisma.membre.count({ where: { organisationId, statutMembre: StatutMembre.INACTIF } }),
      this.prisma.cotisation.findMany({
        where: { membre: { organisationId } },
        select: { statut: true, montant: true },
      }),
    ]);

    const totalCotisations = cotisations.length;
    const cotisationsPayees = cotisations.filter(
      (c) => c.statut === StatutPaiement.PAYE,
    ).length;

    const tauxRecouvrement =
      totalCotisations > 0
        ? Math.round((cotisationsPayees / totalCotisations) * 100)
        : 0;

    return { total, actifs, inactifs, tauxRecouvrement };
  }
}
