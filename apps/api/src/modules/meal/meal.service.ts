import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateIndicateurDto } from './dto/create-indicateur.dto';
import { CreateCollecteDto } from './dto/create-collecte.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MealService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProjet(projetId: string) {
    const projet = await this.prisma.projet.findUnique({
      where: { id: projetId },
      select: { id: true, nom: true, statut: true, indicateurs: true, objectifs: true },
    });
    if (!projet) throw new NotFoundException(`Projet ${projetId} introuvable`);
    return projet;
  }

  async getIndicateurs(projetId: string) {
    const projet = await this.getProjet(projetId);
    const raw = projet.indicateurs as Prisma.JsonArray | null;
    const indicateurs = (raw ?? []) as Record<string, unknown>[];
    return indicateurs.map((ind) => ({
      ...ind,
      tauxAtteinte: ind['valeurCible']
        ? Math.round((Number(ind['valeurRealisee'] ?? 0) / Number(ind['valeurCible'])) * 100)
        : 0,
    }));
  }

  async createIndicateur(projetId: string, dto: CreateIndicateurDto) {
    const projet = await this.getProjet(projetId);
    const existing = (projet.indicateurs as Prisma.JsonArray | null) ?? [];
    const nouvelIndicateur = {
      id: crypto.randomUUID(),
      ...dto,
      valeurRealisee: 0,
      collectes: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...(existing as Record<string, unknown>[]), nouvelIndicateur];
    await this.prisma.projet.update({
      where: { id: projetId },
      data: { indicateurs: updated as Prisma.InputJsonValue },
    });
    return nouvelIndicateur;
  }

  async updateIndicateur(projetId: string, indicateurId: string, dto: Partial<CreateIndicateurDto> & { valeurRealisee?: number }) {
    const projet = await this.getProjet(projetId);
    const indicateurs = ((projet.indicateurs as Prisma.JsonArray | null) ?? []) as Record<string, unknown>[];
    const idx = indicateurs.findIndex((i) => i['id'] === indicateurId);
    if (idx === -1) throw new NotFoundException(`Indicateur ${indicateurId} introuvable`);
    indicateurs[idx] = { ...indicateurs[idx], ...dto, updatedAt: new Date().toISOString() };
    await this.prisma.projet.update({
      where: { id: projetId },
      data: { indicateurs: indicateurs as unknown as Prisma.InputJsonValue },
    });
    return indicateurs[idx];
  }

  async getCollectes(projetId: string, indicateurId: string) {
    const indicateurs = await this.getIndicateurs(projetId);
    const ind = indicateurs.find((i) => i['id'] === indicateurId);
    if (!ind) throw new NotFoundException(`Indicateur ${indicateurId} introuvable`);
    return (ind['collectes'] as unknown[]) ?? [];
  }

  async createCollecte(projetId: string, indicateurId: string, dto: CreateCollecteDto, collecteurId?: string) {
    const projet = await this.getProjet(projetId);
    const indicateurs = ((projet.indicateurs as Prisma.JsonArray | null) ?? []) as Record<string, unknown>[];
    const idx = indicateurs.findIndex((i) => i['id'] === indicateurId);
    if (idx === -1) throw new NotFoundException(`Indicateur ${indicateurId} introuvable`);

    const nouvelleCollecte = {
      id: crypto.randomUUID(),
      ...dto,
      collecteurId,
      createdAt: new Date().toISOString(),
    };

    const collectes = ((indicateurs[idx]['collectes'] as unknown[]) ?? []) as Record<string, unknown>[];
    collectes.push(nouvelleCollecte);
    indicateurs[idx] = { ...indicateurs[idx], collectes, valeurRealisee: dto.valeur };

    await this.prisma.projet.update({
      where: { id: projetId },
      data: { indicateurs: indicateurs as unknown as Prisma.InputJsonValue },
    });

    return nouvelleCollecte;
  }

  async getRapportMEAL(projetId: string) {
    const projet = await this.prisma.projet.findUnique({
      where: { id: projetId },
      include: { activites: true },
    });
    if (!projet) throw new NotFoundException(`Projet ${projetId} introuvable`);

    const indicateurs = await this.getIndicateurs(projetId);
    const totalIndicateurs = indicateurs.length;
    const indicateursAtteints = indicateurs.filter((i) => Number(i['tauxAtteinte']) >= 80).length;
    const tauxMoyenAtteinte =
      totalIndicateurs > 0
        ? Math.round(indicateurs.reduce((sum, i) => sum + Number(i['tauxAtteinte']), 0) / totalIndicateurs)
        : 0;

    return {
      projet: {
        id: projet.id,
        nom: projet.nom,
        statut: projet.statut,
        budget: (projet as any).budgetTotal,
      },
      synthese: {
        totalIndicateurs,
        indicateursAtteints,
        tauxMoyenAtteinte,
        activitesMenees: projet.activites.length,
      },
      indicateurs,
      recommandations:
        tauxMoyenAtteinte < 60
          ? ['Revoir la stratégie d\'intervention', 'Renforcer le suivi terrain']
          : ['Maintenir le rythme actuel', 'Documenter les bonnes pratiques'],
    };
  }

  async getLogCadre(projetId: string) {
    const projet = await this.prisma.projet.findUnique({
      where: { id: projetId },
      include: { activites: true },
    });
    if (!projet) throw new NotFoundException(`Projet ${projetId} introuvable`);

    const indicateurs = ((projet.indicateurs as Prisma.JsonArray | null) ?? []) as Record<string, unknown>[];

    return {
      logique: {
        intrants: {
          description: 'Ressources financières, humaines et matérielles',
          budget: (projet as any).budgetTotal,
          sources: projet.objectifs ? [String(projet.objectifs)] : [],
        },
        activites: projet.activites.map((a) => ({
          id: a.id,
          nom: a.nom,
          statut: a.statut,
          dateDebut: a.dateDebut,
          dateFin: a.dateFin,
        })),
        extrants: indicateurs
          .filter((i) => String(i['type'] ?? 'extrant').includes('extrant'))
          .map((i) => ({ nom: i['nom'], valeurCible: i['valeurCible'], valeurRealisee: i['valeurRealisee'] })),
        effets: indicateurs
          .filter((i) => String(i['type'] ?? '').includes('effet'))
          .map((i) => ({ nom: i['nom'], valeurCible: i['valeurCible'], valeurRealisee: i['valeurRealisee'] })),
        impact: projet.objectifs ? String(projet.objectifs) : 'Non défini',
      },
    };
  }
}
