import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BeneficiairesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, params: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { organisationId: orgId };

    if (search) {
      where['OR'] = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.beneficiaire.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { projets: true } } },
      }),
      this.prisma.beneficiaire.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  findOne(id: string) {
    return this.prisma.beneficiaire.findUnique({ where: { id } });
  }
}
