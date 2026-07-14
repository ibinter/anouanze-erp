import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class OrganisationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrganisationDto) {
    return this.prisma.organisation.create({ data: dto as any });
  }

  async findAll(params: PaginationParams = {}) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { nom: { contains: search, mode: 'insensitive' as const } },
            { sigle: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.organisation.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { _count: { select: { utilisateurs: true } } },
      }),
      this.prisma.organisation.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const org = await this.prisma.organisation.findUnique({ where: { id } });
    if (!org) throw new NotFoundException(`Organisation ${id} introuvable`);
    return org;
  }

  async findBySlug(slug: string) {
    const org = await this.prisma.organisation.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException(`Organisation "${slug}" introuvable`);
    return org;
  }

  async update(id: string, dto: UpdateOrganisationDto) {
    await this.findOne(id);
    return this.prisma.organisation.update({ where: { id }, data: dto as any });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.organisation.delete({ where: { id } });
  }
}
