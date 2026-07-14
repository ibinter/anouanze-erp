import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as ExcelJS from 'exceljs';

interface ImportResult {
  total: number;
  succes: number;
  erreurs: { ligne: number; message: string }[];
}

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  async importerMembres(orgId: string, buffer: Buffer): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];
    const erreurs: { ligne: number; message: string }[] = [];
    let succes = 0;
    let total = 0;

    // Ligne 1 = en-têtes, données à partir de la ligne 2
    sheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
      if (rowNumber === 1) return;
      total++;
      try {
        const nom = String(row.getCell(1).value ?? '').trim();
        const prenom = String(row.getCell(2).value ?? '').trim();
        const email = String(row.getCell(3).value ?? '').trim();
        const telephone = String(row.getCell(4).value ?? '').trim();

        if (!nom) {
          erreurs.push({ ligne: rowNumber, message: 'Le nom est obligatoire' });
          return;
        }

        await this.prisma.membre.create({
          data: {
            organisationId: orgId,
            nom,
            prenom: prenom || undefined,
            email: email || undefined,
            telephone: telephone || undefined,
            statutMembre: 'ACTIF',
          },
        });
        succes++;
      } catch (e: any) {
        erreurs.push({ ligne: rowNumber, message: e.message ?? 'Erreur inconnue' });
      }
    });

    return { total, succes, erreurs };
  }

  async importerDonateurs(orgId: string, buffer: Buffer): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];
    const erreurs: { ligne: number; message: string }[] = [];
    let succes = 0;
    let total = 0;

    sheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
      if (rowNumber === 1) return;
      total++;
      try {
        const nom = String(row.getCell(1).value ?? '').trim();
        const prenom = String(row.getCell(2).value ?? '').trim();
        const email = String(row.getCell(3).value ?? '').trim();
        const typeVal = String(row.getCell(4).value ?? 'INDIVIDU').trim().toUpperCase();
        const type = ['INDIVIDU', 'ENTREPRISE', 'FONDATION', 'GOUVERNEMENT', 'ONG'].includes(typeVal) ? typeVal : 'INDIVIDU';

        if (!nom) {
          erreurs.push({ ligne: rowNumber, message: 'Le nom est obligatoire' });
          return;
        }

        await this.prisma.donateur.create({
          data: {
            organisationId: orgId,
            nom,
            prenom: prenom || undefined,
            email: email || undefined,
            type: type as any,
          },
        });
        succes++;
      } catch (e: any) {
        erreurs.push({ ligne: rowNumber, message: e.message ?? 'Erreur inconnue' });
      }
    });

    return { total, succes, erreurs };
  }

  async genererTemplateXLSX(type: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ANOUANZÊ ERP';
    const sheet = workbook.addWorksheet('Import');

    const styles: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF146C43' } },
    };

    const templates: Record<string, { headers: string[]; exemples: any[][] }> = {
      membres: {
        headers: ['Nom *', 'Prénom', 'Email', 'Téléphone', 'Date adhésion (YYYY-MM-DD)', 'Fonctions'],
        exemples: [['Koné', 'Aminata', 'aminata.kone@email.ci', '+225 07 12 34 56', '2024-01-15', 'Présidente']],
      },
      donateurs: {
        headers: ['Nom *', 'Prénom', 'Email', 'Type (INDIVIDU/ENTREPRISE/FONDATION)', 'Téléphone', 'Pays'],
        exemples: [['Fondation Orange', '', 'contact@orange-fondation.ci', 'FONDATION', '', 'CI']],
      },
      employes: {
        headers: ['Nom *', 'Prénom', 'Email', 'Poste', 'Département', 'Type contrat (CDI/CDD/STAGE)', 'Salaire base', 'Date embauche (YYYY-MM-DD)'],
        exemples: [['Bamba', 'Fatoumata', 'f.bamba@ong.ci', 'Responsable Programme', 'Projets', 'CDI', '350000', '2023-03-01']],
      },
      beneficiaires: {
        headers: ['Nom *', 'Prénom', 'Genre (M/F)', 'Date naissance (YYYY-MM-DD)', 'Village/Quartier', 'Commune', 'Téléphone'],
        exemples: [['Traoré', 'Moussa', 'M', '1995-06-15', 'Abobo', 'Abidjan', '+225 05 45 67 89']],
      },
    };

    const tmpl = templates[type] ?? templates.membres;

    // En-têtes
    const headerRow = sheet.addRow(tmpl.headers);
    headerRow.eachCell((cell) => Object.assign(cell, { style: styles }));
    sheet.getRow(1).height = 20;

    // Largeur colonnes
    tmpl.headers.forEach((_, i) => { sheet.getColumn(i + 1).width = 25; });

    // Exemples
    tmpl.exemples.forEach((ex) => sheet.addRow(ex));

    // Note
    sheet.addRow([]);
    const noteRow = sheet.addRow(['ℹ️ Les colonnes marquées * sont obligatoires. Ne pas modifier la ligne d\'en-tête.']);
    noteRow.getCell(1).font = { italic: true, color: { argb: 'FF888888' } };

    return Buffer.from(await workbook.xlsx.writeBuffer() as ArrayBuffer);
  }

  async validerFichier(type: string, buffer: Buffer): Promise<{
    valide: boolean;
    lignes: number;
    erreurs: { ligne: number; champ: string; message: string }[];
    apercu: any[];
  }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];
    const erreurs: { ligne: number; champ: string; message: string }[] = [];
    const apercu: any[] = [];
    let lignes = 0;

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      lignes++;

      const nom = String(row.getCell(1).value ?? '').trim();
      if (!nom) {
        erreurs.push({ ligne: rowNumber, champ: 'Nom', message: 'Valeur obligatoire manquante' });
      }

      if (apercu.length < 5) {
        apercu.push({
          ligne: rowNumber,
          nom: row.getCell(1).value,
          prenom: row.getCell(2).value,
          email: row.getCell(3).value,
        });
      }
    });

    return { valide: erreurs.length === 0, lignes, erreurs, apercu };
  }
}
