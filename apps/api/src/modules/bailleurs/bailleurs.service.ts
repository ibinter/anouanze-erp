import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBailleurDto } from './dto/create-bailleur.dto';
import { CreateConventionDto } from './dto/create-convention.dto';
import { CreateDecaissementDto } from './dto/create-decaissement.dto';

@Injectable()
export class BailleursService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organisationId: string,
    params: { page?: number; limit?: number; search?: string },
  ) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { organisationId };

    if (search) {
      where['OR'] = [
        { nom: { contains: search, mode: 'insensitive' } },
        { sigle: { contains: search, mode: 'insensitive' } },
        { pays: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.bailleur.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { conventions: true } } },
      }),
      this.prisma.bailleur.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, organisationId: string) {
    const bailleur = await this.prisma.bailleur.findFirst({
      where: { id, organisationId },
      include: { conventions: { orderBy: { createdAt: 'desc' } } },
    });

    if (!bailleur) throw new NotFoundException(`Bailleur ${id} introuvable`);
    return bailleur;
  }

  async create(organisationId: string, dto: CreateBailleurDto) {
    return this.prisma.bailleur.create({ data: { ...dto, organisationId } });
  }

  async update(id: string, organisationId: string, dto: Partial<CreateBailleurDto>) {
    await this.findOne(id, organisationId);
    return this.prisma.bailleur.update({ where: { id }, data: dto });
  }

  async getConventions(bailleurId: string) {
    const bailleur = await this.prisma.bailleur.findUnique({ where: { id: bailleurId } });
    if (!bailleur) throw new NotFoundException(`Bailleur ${bailleurId} introuvable`);

    return this.prisma.convention.findMany({
      where: { bailleurId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { decaissements: true } } },
    });
  }

  async createConvention(bailleurId: string, dto: CreateConventionDto) {
    const bailleur = await this.prisma.bailleur.findUnique({ where: { id: bailleurId } });
    if (!bailleur) throw new NotFoundException(`Bailleur ${bailleurId} introuvable`);

    const existing = await this.prisma.convention.findFirst({
      where: { bailleurId, reference: dto.reference },
    });
    if (existing) {
      throw new BadRequestException(`La référence de convention ${dto.reference} existe déjà`);
    }

    return this.prisma.convention.create({
      data: {
        ...dto,
        bailleurId,
        dateSignature: new Date(dto.dateSignature),
        dateDebut: new Date(dto.dateDebut),
        dateFin: new Date(dto.dateFin),
      } as any,
    });
  }

  async getDecaissements(conventionId: string) {
    const convention = await this.prisma.convention.findUnique({ where: { id: conventionId } });
    if (!convention) throw new NotFoundException(`Convention ${conventionId} introuvable`);

    return this.prisma.decaissement.findMany({
      where: { conventionId },
      orderBy: { dateReception: 'desc' },
    });
  }

  async createDecaissement(conventionId: string, dto: CreateDecaissementDto) {
    const convention = await this.prisma.convention.findUnique({ where: { id: conventionId } });
    if (!convention) throw new NotFoundException(`Convention ${conventionId} introuvable`);

    return this.prisma.decaissement.create({
      data: {
        ...dto,
        conventionId,
        dateReception: new Date(dto.dateReception),
      },
    });
  }

  async getTauxJustification(conventionId: string) {
    const convention = await this.prisma.convention.findUnique({
      where: { id: conventionId },
      include: { decaissements: true },
    });

    if (!convention) throw new NotFoundException(`Convention ${conventionId} introuvable`);

    const montantDecaisse = convention.decaissements.reduce(
      (sum, d) => sum + Number(d.montant),
      0,
    );

    let montantJustifie = 0;

    if (convention.projetId) {
      const ecritures = await this.prisma.ecritureComptable.findMany({
        where: { projetId: convention.projetId, valide: true },
        select: { totalDebit: true },
      });
      montantJustifie = ecritures.reduce((sum, e) => sum + Number(e.totalDebit), 0);
    }

    const tauxJustification =
      montantDecaisse > 0
        ? Math.round((montantJustifie / montantDecaisse) * 100)
        : 0;

    return {
      conventionId,
      montantTotal: Number(convention.montantTotal),
      montantDecaisse,
      montantJustifie,
      tauxJustification,
      resteADecaisser: Number(convention.montantTotal) - montantDecaisse,
      resteAJustifier: montantDecaisse - montantJustifie,
    };
  }
}
