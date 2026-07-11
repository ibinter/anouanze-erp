import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { CreateCommandeDto } from './dto/create-commande.dto';

@Injectable()
export class AchatsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllFournisseurs(orgId: string, params: { page?: number; limit?: number; search?: string }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const where: Record<string, unknown> = { organisationId: orgId, actif: true };
    if (params.search) {
      where['OR'] = [
        { nom: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.fournisseur.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.fournisseur.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async createFournisseur(orgId: string, dto: CreateFournisseurDto) {
    return this.prisma.fournisseur.create({
      data: {
        organisationId: orgId,
        nom: dto.nom,
        numeroFiscal: dto.numeroFiscal,
        telephone: dto.telephone,
        email: dto.email,
        adresse: dto.adresse as any,
        pays: dto.pays,
      } as any,
    });
  }

  async updateFournisseur(id: string, orgId: string, dto: Partial<CreateFournisseurDto>) {
    const f = await this.prisma.fournisseur.findFirst({ where: { id, organisationId: orgId } });
    if (!f) throw new NotFoundException(`Fournisseur ${id} introuvable`);
    return this.prisma.fournisseur.update({ where: { id }, data: dto as any });
  }

  async findAllCommandes(orgId: string, params: { page?: number; limit?: number; statut?: string }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const where: Record<string, unknown> = { fournisseur: { organisationId: orgId } };
    if (params.statut) where['statut'] = params.statut;

    const [data, total] = await Promise.all([
      this.prisma.commandeAchat.findMany({
        where,
        include: { fournisseur: { select: { id: true, nom: true } } },
        orderBy: { dateCommande: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.commandeAchat.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOneCommande(id: string, orgId: string) {
    const commande = await this.prisma.commandeAchat.findFirst({
      where: { id, fournisseur: { organisationId: orgId } },
      include: { fournisseur: true },
    });
    if (!commande) throw new NotFoundException(`Commande ${id} introuvable`);
    return commande;
  }

  async createCommande(orgId: string, dto: CreateCommandeDto) {
    const fournisseur = await this.prisma.fournisseur.findFirst({
      where: { id: dto.fournisseurId, organisationId: orgId },
    });
    if (!fournisseur) throw new NotFoundException(`Fournisseur ${dto.fournisseurId} introuvable`);

    return this.prisma.commandeAchat.create({
      data: {
        fournisseurId: dto.fournisseurId,
        numero: dto.numero,
        dateCommande: new Date(dto.dateCommande),
        dateLivraison: dto.dateLivraison ? new Date(dto.dateLivraison) : undefined,
        montantTotal: dto.montantTotal,
        devise: (dto.devise ?? 'XOF') as never,
        notes: dto.notes,
        statut: 'BROUILLON',
      },
      include: { fournisseur: { select: { id: true, nom: true } } },
    });
  }

  async validerCommande(id: string, orgId: string) {
    const commande = await this.findOneCommande(id, orgId);
    if (commande.statut !== 'BROUILLON') {
      throw new BadRequestException('Seules les commandes en brouillon peuvent être validées');
    }
    return this.prisma.commandeAchat.update({ where: { id }, data: { statut: 'VALIDEE' } });
  }

  async recevoirCommande(id: string, orgId: string) {
    const commande = await this.findOneCommande(id, orgId);
    if (!['VALIDEE', 'EN_COURS'].includes(commande.statut)) {
      throw new BadRequestException('La commande doit être validée avant d\'être réceptionnée');
    }
    return this.prisma.commandeAchat.update({
      where: { id },
      data: { statut: 'RECUE', dateLivraison: new Date() },
    });
  }

  async getStats(orgId: string) {
    const commandes = await this.prisma.commandeAchat.findMany({
      where: { fournisseur: { organisationId: orgId } },
      select: { statut: true, montantTotal: true },
    });

    const total = commandes.length;
    const montantTotal = commandes.reduce((s, c) => s + Number(c.montantTotal), 0);
    const enAttente = commandes.filter((c) => c.statut === 'BROUILLON').length;
    const recues = commandes.filter((c) => c.statut === 'RECUE').length;

    return { total, montantTotal, enAttente, recues };
  }
}
