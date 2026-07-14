import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StatutTicket, PrioriteTicket } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  private async genererReference(): Promise<string> {
    const count = await this.prisma.ticketSupport.count();
    return `TKT-${String(count + 1).padStart(5, '0')}`;
  }

  async listerTickets(utilisateurId: string, orgId?: string, params?: { statut?: StatutTicket; page?: number; limit?: number }) {
    const { statut, page = 1, limit = 20 } = params ?? {};
    const skip = (page - 1) * limit;

    const where = {
      utilisateurId,
      ...(statut ? { statut } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.ticketSupport.findMany({
        where,
        include: { messages: { orderBy: { createdAt: 'asc' } } },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.ticketSupport.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getTicket(id: string) {
    const ticket = await this.prisma.ticketSupport.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!ticket) throw new NotFoundException('Ticket non trouvé');
    return ticket;
  }

  async creerTicket(utilisateurId: string, orgId: string | undefined, data: {
    sujet: string;
    description: string;
    categorie?: string;
    priorite?: PrioriteTicket;
  }) {
    const reference = await this.genererReference();
    return this.prisma.ticketSupport.create({
      data: {
        utilisateurId,
        organisationId: orgId,
        reference,
        sujet: data.sujet,
        description: data.description,
        categorie: data.categorie ?? 'GENERAL',
        priorite: data.priorite ?? 'NORMALE',
      },
    });
  }

  async ajouterMessage(ticketId: string, contenu: string, auteur: string, estSupport = false) {
    await this.prisma.ticketSupport.update({
      where: { id: ticketId },
      data: { updatedAt: new Date(), statut: estSupport ? 'EN_ATTENTE' : 'EN_COURS' },
    });
    return this.prisma.messageTicket.create({
      data: { ticketId, contenu, auteur, estSupport },
    });
  }

  async changerStatut(id: string, statut: StatutTicket) {
    return this.prisma.ticketSupport.update({ where: { id }, data: { statut } });
  }

  async getStats(utilisateurId: string) {
    const stats = await this.prisma.ticketSupport.groupBy({
      by: ['statut'],
      where: { utilisateurId },
      _count: true,
    });
    return Object.fromEntries(stats.map((s) => [s.statut, s._count]));
  }
}
