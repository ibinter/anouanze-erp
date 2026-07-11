import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { MouvementStockDto } from './dto/mouvement-stock.dto';

@Injectable()
export class StocksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, params: { categorie?: string; page?: number; limit?: number }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const where: Record<string, unknown> = { organisationId: orgId };
    if (params.categorie) where['categorie'] = params.categorie;

    const [data, total] = await Promise.all([
      this.prisma.stock.findMany({
        where,
        orderBy: { designation: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.stock.count({ where }),
    ]);

    return {
      data: data.map((s) => ({
        ...s,
        alerteStock: Number(s.stockActuel) < Number(s.stockMinimum),
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, orgId: string) {
    const stock = await this.prisma.stock.findFirst({ where: { id, organisationId: orgId } });
    if (!stock) throw new NotFoundException(`Stock ${id} introuvable`);
    return { ...stock, alerteStock: Number(stock.stockActuel) < Number(stock.stockMinimum) };
  }

  async create(orgId: string, dto: CreateStockDto) {
    return this.prisma.stock.create({
      data: {
        organisationId: orgId,
        reference: dto.reference,
        designation: dto.designation,
        categorie: dto.categorie,
        unite: dto.unite,
        stockMinimum: dto.stockMinimum ?? 0,
        prixUnitaire: dto.prixUnitaire,
        localisation: dto.localisation,
      },
    });
  }

  async update(id: string, orgId: string, dto: Partial<CreateStockDto>) {
    await this.findOne(id, orgId);
    return this.prisma.stock.update({ where: { id }, data: dto });
  }

  async entree(stockId: string, dto: MouvementStockDto) {
    const stock = await this.prisma.stock.findUnique({ where: { id: stockId } });
    if (!stock) throw new NotFoundException(`Stock ${stockId} introuvable`);

    const [mouvement] = await this.prisma.$transaction([
      this.prisma.mouvementStock.create({
        data: {
          stockId,
          type: 'ENTREE',
          quantite: dto.quantite,
          dateOperation: new Date(),
          motif: dto.motif,
          reference: dto.reference,
        },
      }),
      this.prisma.stock.update({
        where: { id: stockId },
        data: { stockActuel: { increment: dto.quantite } },
      }),
    ]);

    return mouvement;
  }

  async sortie(stockId: string, dto: MouvementStockDto) {
    const stock = await this.prisma.stock.findUnique({ where: { id: stockId } });
    if (!stock) throw new NotFoundException(`Stock ${stockId} introuvable`);
    if (Number(stock.stockActuel) < dto.quantite) {
      throw new BadRequestException(
        `Stock insuffisant. Disponible: ${stock.stockActuel}, demandé: ${dto.quantite}`,
      );
    }

    const [mouvement] = await this.prisma.$transaction([
      this.prisma.mouvementStock.create({
        data: {
          stockId,
          type: 'SORTIE',
          quantite: dto.quantite,
          dateOperation: new Date(),
          motif: dto.motif,
          reference: dto.reference,
        },
      }),
      this.prisma.stock.update({
        where: { id: stockId },
        data: { stockActuel: { decrement: dto.quantite } },
      }),
    ]);

    return mouvement;
  }

  async getMouvements(stockId: string, params: { page?: number; limit?: number }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;

    const [data, total] = await Promise.all([
      this.prisma.mouvementStock.findMany({
        where: { stockId },
        orderBy: { dateOperation: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.mouvementStock.count({ where: { stockId } }),
    ]);

    return { data, total, page, limit };
  }

  async getAlertes(orgId: string) {
    const stocks = await this.prisma.stock.findMany({ where: { organisationId: orgId } });
    return stocks
      .filter((s) => Number(s.stockActuel) < Number(s.stockMinimum))
      .map((s) => ({
        ...s,
        ecart: Number(s.stockMinimum) - Number(s.stockActuel),
      }));
  }
}
