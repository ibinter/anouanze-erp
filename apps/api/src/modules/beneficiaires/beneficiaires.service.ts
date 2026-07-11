import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BeneficiairesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(orgId: string) {
    return this.prisma.beneficiaire.findMany({
      where: { projets: { some: { projet: { organisationId: orgId } } } },
    });
  }

  findOne(id: string) {
    return this.prisma.beneficiaire.findUnique({ where: { id } });
  }
}
