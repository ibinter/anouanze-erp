import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, StatutProspect } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../../common/email/email.service';
import { CreateProspectDto } from './dto/create-prospect.dto';

export interface ListerProspectsParams {
  statut?: StatutProspect;
  recherche?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ProspectsService {
  private readonly logger = new Logger(ProspectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  /**
   * Enregistre une demande de démonstration (route publique) puis envoie
   * la confirmation. L'envoi est **non bloquant** : un incident SMTP ne doit
   * jamais faire échouer la soumission du formulaire.
   */
  async creer(dto: CreateProspectDto) {
    const prospect = await this.prisma.prospect.create({
      data: {
        nom: dto.nom.trim(),
        prenom: dto.prenom?.trim() || null,
        email: dto.email.trim().toLowerCase(),
        telephone: dto.telephone?.trim() || null,
        organisation: dto.organisation?.trim() || null,
        fonction: dto.fonction?.trim() || null,
        pays: dto.pays?.trim() || null,
        secteur: dto.secteur?.trim() || null,
        tailleStructure: dto.tailleStructure?.trim() || null,
        besoin: dto.besoin?.trim() || null,
        nbUtilisateurs: dto.nbUtilisateurs ?? null,
        dateSouhaitee: dto.dateSouhaitee ? new Date(dto.dateSouhaitee) : null,
        source: dto.source?.trim() || 'site-web',
        consentement: dto.consentement ?? false,
        statut: StatutProspect.NOUVEAU,
      },
    });

    // Confirmation de démo — jamais bloquante.
    void this.email
      .sendConfirmationDemo(prospect.email, {
        nomContact: [prospect.prenom, prospect.nom].filter(Boolean).join(' ') || prospect.nom,
        organisationNom: prospect.organisation ?? undefined,
        dateSouhaitee: prospect.dateSouhaitee ?? undefined,
      })
      .catch((err: unknown) =>
        this.logger.warn(
          `Confirmation de démo non envoyée à ${prospect.email} : ${(err as Error).message}`,
        ),
      );

    this.logger.log(
      `Nouveau prospect ${prospect.email}${prospect.organisation ? ` (${prospect.organisation})` : ''} — source ${prospect.source}`,
    );

    return {
      success: true,
      message:
        'Votre demande de démonstration a bien été enregistrée. Notre équipe vous recontacte sous 48 h.',
      id: prospect.id,
    };
  }

  async lister(params: ListerProspectsParams = {}) {
    const { statut, recherche } = params;
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);

    const where: Prisma.ProspectWhereInput = {
      ...(statut ? { statut } : {}),
      ...(recherche
        ? {
            OR: [
              { nom: { contains: recherche, mode: Prisma.QueryMode.insensitive } },
              { prenom: { contains: recherche, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: recherche, mode: Prisma.QueryMode.insensitive } },
              { organisation: { contains: recherche, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.prospect.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.prospect.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getStats() {
    const parStatut = await this.prisma.prospect.groupBy({
      by: ['statut'],
      _count: { _all: true },
    });

    const total = parStatut.reduce((acc, l) => acc + l._count._all, 0);

    return {
      total,
      parStatut: parStatut.map((l) => ({ statut: l.statut, nombre: l._count._all })),
    };
  }

  async getProspect(id: string) {
    const prospect = await this.prisma.prospect.findUnique({ where: { id } });
    if (!prospect) throw new NotFoundException('Prospect introuvable');
    return prospect;
  }

  async changerStatut(id: string, statut: StatutProspect, note?: string) {
    const prospect = await this.getProspect(id);

    const notes = note ? this.concatNote(prospect.notes, note) : prospect.notes;

    return this.prisma.prospect.update({
      where: { id },
      data: { statut, notes },
    });
  }

  async ajouterNote(id: string, note: string) {
    const prospect = await this.getProspect(id);
    return this.prisma.prospect.update({
      where: { id },
      data: { notes: this.concatNote(prospect.notes, note) },
    });
  }

  private concatNote(existant: string | null, note: string): string {
    const entree = `[${new Date().toISOString().slice(0, 16).replace('T', ' ')}] ${note.trim()}`;
    return existant ? `${existant}\n${entree}` : entree;
  }
}
