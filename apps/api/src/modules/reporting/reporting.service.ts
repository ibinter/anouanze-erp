import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

const MOIS_COURTS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
];

const SECTEUR_LABELS: Record<string, string> = {
  sante: 'Santé',
  education: 'Éducation',
  agriculture: 'Agriculture',
  eau_assainissement: 'Eau & Assainissement',
  environnement: 'Environnement',
  genre: 'Genre',
  securite_alimentaire: 'Sécurité alimentaire',
  gouvernance: 'Gouvernance',
  formation: 'Formation',
  microfinance: 'Microfinance',
  non_categorise: 'Non catégorisé',
};

function libelleSecteur(slug: string): string {
  const connu = SECTEUR_LABELS[slug];
  if (connu) return connu;
  const nettoye = slug.replace(/[_-]+/g, ' ').trim();
  return nettoye.charAt(0).toUpperCase() + nettoye.slice(1);
}

@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Dépenses réelles (comptes de charges classe 6) sur les N derniers mois
   * glissants — traverse les bornes d'exercice, contrairement à
   * getDepensesParMois qui est borné à un exercice civil.
   */
  async getEvolutionDepenses(orgId: string, nbMois: number) {
    const taille = Math.min(Math.max(Number(nbMois) || 6, 1), 24);
    const now = new Date();

    const periodes: { periode: string; mois: string; annee: number }[] = [];
    for (let i = taille - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periodes.push({
        periode: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        mois: MOIS_COURTS[d.getMonth()],
        annee: d.getFullYear(),
      });
    }

    const ecritures = await this.prisma.ecritureComptable.findMany({
      where: {
        organisationId: orgId,
        valide: true,
        periode: { in: periodes.map((p) => p.periode) },
      },
      select: {
        periode: true,
        lignes: {
          select: { debit: true, credit: true, compte: { select: { numero: true } } },
        },
      },
    });

    const totaux: Record<string, number> = {};
    for (const p of periodes) totaux[p.periode] = 0;

    for (const e of ecritures) {
      const montant = e.lignes
        .filter((l) => l.compte.numero.startsWith('6'))
        .reduce((s, l) => s + Number(l.debit) - Number(l.credit), 0);
      if (totaux[e.periode] !== undefined) totaux[e.periode] += montant;
    }

    return periodes.map((p) => ({
      periode: p.periode,
      mois: p.mois,
      annee: p.annee,
      montant: Math.round(Math.max(0, totaux[p.periode] ?? 0)),
    }));
  }

  /**
   * Répartition des dépenses réelles par secteur d'intervention.
   * Le montant d'un projet est réparti à parts égales entre ses secteurs.
   * Retourne un tableau vide s'il n'y a aucune dépense (jamais de valeur fictive).
   */
  async getRepartitionSecteurs(orgId: string, exercice: number) {
    const projets = await this.prisma.projet.findMany({
      where: { organisationId: orgId },
      select: {
        secteurs: true,
        ecritures: {
          where: { exercice, valide: true },
          select: {
            lignes: {
              select: { debit: true, credit: true, compte: { select: { numero: true } } },
            },
          },
        },
      },
    });

    const parSecteur: Record<string, number> = {};

    for (const p of projets) {
      const montant = p.ecritures.reduce(
        (s, e) =>
          s +
          e.lignes
            .filter((l) => l.compte.numero.startsWith('6'))
            .reduce((ls, l) => ls + Number(l.debit) - Number(l.credit), 0),
        0,
      );
      if (montant <= 0) continue;

      const secteurs = p.secteurs.length > 0 ? p.secteurs : ['non_categorise'];
      const part = montant / secteurs.length;
      for (const s of secteurs) parSecteur[s] = (parSecteur[s] ?? 0) + part;
    }

    const total = Object.values(parSecteur).reduce((s, v) => s + v, 0);
    if (total <= 0) return [];

    return Object.entries(parSecteur)
      .map(([secteur, montant]) => ({
        secteur,
        libelle: libelleSecteur(secteur),
        montant: Math.round(montant),
        pourcentage: Math.round((montant / total) * 100),
      }))
      .sort((a, b) => b.montant - a.montant);
  }

  async getTableauBord(orgId: string) {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [membresActifs, projetsEnCours, comptesBancaires, donsduMois, budgets, cotisationsEnRetard] =
      await Promise.all([
        this.prisma.membre.count({ where: { organisationId: orgId, statutMembre: 'ACTIF' } }),
        this.prisma.projet.count({ where: { organisationId: orgId, statut: 'EN_COURS' } }),
        this.prisma.compteBancaire.findMany({
          where: { organisationId: orgId, actif: true },
          include: { mouvements: { select: { debit: true, credit: true } } },
        }),
        this.prisma.don.findMany({
          where: {
            donateur: { organisationId: orgId },
            dateDon: { gte: debutMois, lte: finMois },
            type: 'NUMERAIRE',
          },
          select: { montant: true },
        }),
        this.prisma.budget.findMany({
          where: { organisationId: orgId, exercice: now.getFullYear() },
          include: { lignes: { select: { montantPrevu: true, montantRealise: true } } },
        }),
        this.prisma.cotisation.findMany({
          where: {
            membre: { organisationId: orgId },
            statut: 'EN_RETARD',
          },
          select: { id: true, montant: true, membreId: true },
        }),
      ]);

    const soldeTresorerie = comptesBancaires.reduce((sum, cb) => {
      const totalCredits = cb.mouvements.reduce((s, m) => s + Number(m.credit), 0);
      const totalDebits = cb.mouvements.reduce((s, m) => s + Number(m.debit), 0);
      return sum + Number(cb.soldeInitial) + totalCredits - totalDebits;
    }, 0);

    const totalDonsMois = donsduMois.reduce((s, d) => s + Number(d.montant ?? 0), 0);

    const budgetPrevu = budgets.reduce(
      (s, b) => s + b.lignes.reduce((ls, l) => ls + Number(l.montantPrevu), 0),
      0,
    );
    const budgetRealise = budgets.reduce(
      (s, b) => s + b.lignes.reduce((ls, l) => ls + Number(l.montantRealise), 0),
      0,
    );

    const alertesBudgets = budgets
      .map((b) => {
        const prevu = b.lignes.reduce((s, l) => s + Number(l.montantPrevu), 0);
        const realise = b.lignes.reduce((s, l) => s + Number(l.montantRealise), 0);
        const taux = prevu > 0 ? Math.round((realise / prevu) * 100) : 0;
        return { nom: b.nom, taux };
      })
      .filter((b) => b.taux >= 80);

    return {
      membresActifs,
      projetsEnCours,
      soldeTresorerie,
      totalDonsMois,
      budgetPrevu,
      budgetRealise,
      tauxExecution: budgetPrevu > 0 ? Math.round((budgetRealise / budgetPrevu) * 100) : 0,
      alertesBudgets,
      cotisationsEnRetard: cotisationsEnRetard.map((c) => ({ id: c.id, montant: Number(c.montant) })),
      prochainEvenement: null,
    };
  }

  async getDepensesParMois(orgId: string, exercice: number) {
    const ecritures = await this.prisma.ecritureComptable.findMany({
      where: {
        organisationId: orgId,
        exercice,
        valide: true,
        lignes: {
          some: {
            compte: { numero: { startsWith: '6' } },
          },
        },
      },
      select: { periode: true, lignes: { select: { debit: true, compte: { select: { numero: true } } } } },
    });

    const parMois: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) parMois[m] = 0;

    for (const e of ecritures) {
      const mois = parseInt(e.periode.split('-')[1], 10);
      const montant = e.lignes
        .filter((l) => l.compte.numero.startsWith('6'))
        .reduce((s, l) => s + Number(l.debit), 0);
      parMois[mois] = (parMois[mois] ?? 0) + montant;
    }

    return Array.from({ length: 12 }, (_, i) => ({ mois: i + 1, montant: parMois[i + 1] }));
  }

  async getDepensesParProjet(orgId: string, exercice: number) {
    const projets = await this.prisma.projet.findMany({
      where: { organisationId: orgId },
      select: {
        id: true,
        nom: true,
        ecritures: {
          where: { exercice, valide: true },
          select: { lignes: { select: { debit: true, compte: { select: { numero: true } } } } },
        },
      },
    });

    return projets
      .map((p) => ({
        projetNom: p.nom,
        montant: p.ecritures.reduce(
          (s, e) =>
            s +
            e.lignes
              .filter((l) => l.compte.numero.startsWith('6'))
              .reduce((ls, l) => ls + Number(l.debit), 0),
          0,
        ),
      }))
      .filter((p) => p.montant > 0);
  }

  async getDepensesParBailleur(orgId: string, exercice: number) {
    const bailleurs = await this.prisma.bailleur.findMany({
      where: { organisationId: orgId },
      select: {
        nom: true,
        conventions: {
          select: {
            projet: {
              select: {
                ecritures: {
                  where: { exercice, valide: true },
                  select: { lignes: { select: { debit: true, compte: { select: { numero: true } } } } },
                },
              },
            },
          },
        },
      },
    });

    return bailleurs
      .map((b) => ({
        bailleurNom: b.nom,
        montant: b.conventions.reduce(
          (cs, c) =>
            cs +
            (c.projet?.ecritures ?? []).reduce(
              (es, e) =>
                es +
                e.lignes
                  .filter((l) => l.compte.numero.startsWith('6'))
                  .reduce((ls, l) => ls + Number(l.debit), 0),
              0,
            ),
          0,
        ),
      }))
      .filter((b) => b.montant > 0);
  }

  async getRapportFinancier(orgId: string, exercice: number) {
    const ecritures = await this.prisma.ecritureComptable.findMany({
      where: { organisationId: orgId, exercice, valide: true },
      select: { lignes: { select: { debit: true, credit: true, compte: { select: { numero: true } } } } },
    });

    let totalProduits = 0;
    let totalCharges = 0;

    for (const e of ecritures) {
      for (const l of e.lignes) {
        if (l.compte.numero.startsWith('7')) totalProduits += Number(l.credit) - Number(l.debit);
        if (l.compte.numero.startsWith('6')) totalCharges += Number(l.debit) - Number(l.credit);
      }
    }

    return {
      exercice,
      totalProduits,
      totalCharges,
      resultat: totalProduits - totalCharges,
    };
  }

  async getBilanSimplifie(orgId: string, exercice: number) {
    const ecritures = await this.prisma.ecritureComptable.findMany({
      where: { organisationId: orgId, exercice, valide: true },
      select: { lignes: { select: { debit: true, credit: true, compte: { select: { numero: true } } } } },
    });

    let actif = 0;
    let passif = 0;

    for (const e of ecritures) {
      for (const l of e.lignes) {
        const num = l.compte.numero[0];
        const solde = Number(l.debit) - Number(l.credit);
        if (['2', '3', '5'].includes(num)) actif += solde;
        if (['1', '4'].includes(num)) passif += -solde;
      }
    }

    return { exercice, actif, passif, equilibre: actif - passif };
  }

  async exporterRapportPDF(orgId: string, type: string, params: Record<string, unknown>): Promise<Buffer> {
    let data: unknown;
    const exercice = (params['exercice'] as number) ?? new Date().getFullYear();

    if (type === 'tableau-bord') data = await this.getTableauBord(orgId);
    else if (type === 'rapport-financier') data = await this.getRapportFinancier(orgId, exercice);
    else if (type === 'bilan') data = await this.getBilanSimplifie(orgId, exercice);
    else data = { message: 'Rapport non disponible' };

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"><title>Rapport ${type}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#333}h1{color:#146C43}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}</style>
      </head>
      <body>
        <h1>ANOUANZÊ ERP — ${type.toUpperCase()}</h1>
        <p>Exercice ${exercice} — Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body></html>`;

    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
    await browser.close();
    return Buffer.from(pdf);
  }

  async exporterExcel(orgId: string, type: string, params: Record<string, unknown>): Promise<Buffer> {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.default.Workbook();
    workbook.creator = 'ANOUANZÊ ERP';
    const exercice = (params['exercice'] as number) ?? new Date().getFullYear();

    const sheet = workbook.addWorksheet(type);

    if (type === 'depenses-par-mois') {
      const data = await this.getDepensesParMois(orgId, exercice);
      sheet.addRow(['Mois', 'Montant (XOF)']);
      data.forEach((r) => sheet.addRow([r.mois, r.montant]));
    } else if (type === 'depenses-par-projet') {
      const data = await this.getDepensesParProjet(orgId, exercice);
      sheet.addRow(['Projet', 'Montant (XOF)']);
      data.forEach((r) => sheet.addRow([r.projetNom, r.montant]));
    } else if (type === 'rapport-financier') {
      const data = await this.getRapportFinancier(orgId, exercice);
      sheet.addRow(['Indicateur', 'Montant']);
      sheet.addRow(['Total Produits', data.totalProduits]);
      sheet.addRow(['Total Charges', data.totalCharges]);
      sheet.addRow(['Résultat', data.resultat]);
    } else {
      sheet.addRow(['Type non supporté']);
    }

    return Buffer.from(await workbook.xlsx.writeBuffer() as ArrayBuffer);
  }
}
