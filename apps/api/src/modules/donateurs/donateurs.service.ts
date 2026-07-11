import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDonateurDto } from './dto/create-donateur.dto';
import { CreateDonDto } from './dto/create-don.dto';

@Injectable()
export class DonateursService {
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
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.donateur.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { dons: true } } },
      }),
      this.prisma.donateur.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, organisationId: string) {
    const donateur = await this.prisma.donateur.findFirst({
      where: { id, organisationId },
      include: { dons: { orderBy: { dateDon: 'desc' } } },
    });

    if (!donateur) throw new NotFoundException(`Donateur ${id} introuvable`);
    return donateur;
  }

  async create(organisationId: string, dto: CreateDonateurDto) {
    return this.prisma.donateur.create({ data: { ...dto, organisationId } as any });
  }

  async update(id: string, organisationId: string, dto: Partial<CreateDonateurDto>) {
    await this.findOne(id, organisationId);
    return this.prisma.donateur.update({ where: { id }, data: dto as any });
  }

  async getDons(donateurId: string, params: { page?: number; limit?: number }) {
    const donateur = await this.prisma.donateur.findUnique({ where: { id: donateurId } });
    if (!donateur) throw new NotFoundException(`Donateur ${donateurId} introuvable`);

    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.don.findMany({
        where: { donateurId },
        skip,
        take: limit,
        orderBy: { dateDon: 'desc' },
      }),
      this.prisma.don.count({ where: { donateurId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createDon(donateurId: string, dto: CreateDonDto) {
    const donateur = await this.prisma.donateur.findUnique({ where: { id: donateurId } });
    if (!donateur) throw new NotFoundException(`Donateur ${donateurId} introuvable`);

    let numeroRecu: string | undefined;

    if (dto.recu) {
      const count = await this.prisma.don.count({ where: { recu: true } });
      numeroRecu = `RECU-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    }

    return this.prisma.don.create({
      data: {
        ...dto,
        donateurId,
        dateDon: new Date(dto.dateDon),
        numeroRecu,
      },
    });
  }

  async genererRecu(donId: string) {
    const don = await this.prisma.don.findUnique({
      where: { id: donId },
      include: { donateur: true },
    });

    if (!don) throw new NotFoundException(`Don ${donId} introuvable`);
    if (don.recu && don.numeroRecu) {
      return { don, message: 'Reçu déjà généré', numeroRecu: don.numeroRecu };
    }

    const count = await this.prisma.don.count({ where: { recu: true } });
    const numeroRecu = `RECU-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const updated = await this.prisma.don.update({
      where: { id: donId },
      data: { recu: true, numeroRecu },
      include: { donateur: true },
    });

    return { don: updated, numeroRecu, message: 'Reçu généré avec succès' };
  }

  async getStats(organisationId: string) {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalDonateurs, dons, donsMois] = await Promise.all([
      this.prisma.donateur.count({ where: { organisationId } }),
      this.prisma.don.findMany({
        where: { donateur: { organisationId } },
        select: { montant: true },
      }),
      this.prisma.don.findMany({
        where: {
          donateur: { organisationId },
          dateDon: { gte: debutMois },
        },
        select: { montant: true },
      }),
    ]);

    const totalDons = dons.length;
    const montantTotal = dons.reduce((sum, d) => sum + Number(d.montant ?? 0), 0);
    const montantCeMois = donsMois.reduce((sum, d) => sum + Number(d.montant ?? 0), 0);

    return { totalDonateurs, totalDons, montantTotal, montantCeMois };
  }
}
