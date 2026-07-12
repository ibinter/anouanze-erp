/**
 * Utilitaires d'export XLSX et PDF — ANOUANZÊ ERP
 * Palette : #146C43 (vert) / #F28C25 (orange)
 */

// ─── XLSX Export ─────────────────────────────────────────────────────────────

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  format?: 'currency' | 'date' | 'number' | 'text';
}

function formatCellValue(value: unknown, format?: ExportColumn['format']): string | number {
  if (value === null || value === undefined) return '';

  if (format === 'currency') {
    const num = Number(value);
    return isNaN(num) ? '' : num;
  }
  if (format === 'date' && typeof value === 'string') {
    try {
      return new Date(value).toLocaleDateString('fr-CI');
    } catch {
      return String(value);
    }
  }
  if (format === 'number') {
    const num = Number(value);
    return isNaN(num) ? '' : num;
  }
  return String(value);
}

export async function exportXLSX(options: {
  filename: string;
  sheetName?: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  title?: string;
  subtitle?: string;
  organisation?: string;
  periode?: string;
}): Promise<void> {
  const XLSX = await import('xlsx');

  const {
    filename,
    sheetName = 'Données',
    columns,
    data,
    title,
    subtitle,
    organisation,
    periode,
  } = options;

  const rows: (string | number)[][] = [];

  // En-têtes informatifs
  if (title) rows.push([title]);
  if (organisation) rows.push([`Organisation : ${organisation}`]);
  if (periode) rows.push([`Période : ${periode}`]);
  if (subtitle) rows.push([subtitle]);
  rows.push([`Généré le : ${new Date().toLocaleDateString('fr-CI')} à ${new Date().toLocaleTimeString('fr-CI')}`]);
  rows.push([]); // ligne vide

  // En-têtes colonnes
  rows.push(columns.map((c) => c.header));

  // Données
  for (const row of data) {
    rows.push(
      columns.map((col) => {
        const raw = col.key.split('.').reduce<unknown>((obj, key) => {
          if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[key];
          return undefined;
        }, row);
        return formatCellValue(raw, col.format);
      }),
    );
  }

  // Ligne totaux si données numériques
  const hasNumeric = columns.some((c) => c.format === 'currency' || c.format === 'number');
  if (hasNumeric && data.length > 0) {
    const totalRow: (string | number)[] = columns.map((col, i) => {
      if (i === 0) return 'TOTAL';
      if (col.format === 'currency' || col.format === 'number') {
        return data.reduce((sum, row) => {
          const val = Number(row[col.key] ?? 0);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);
      }
      return '';
    });
    rows.push([]);
    rows.push(totalRow);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Largeurs de colonnes
  ws['!cols'] = columns.map((c) => ({ wch: c.width ?? 20 }));

  // Style en-tête données (ligne info + 1 vide = offset)
  const headerOffset = (title ? 1 : 0) + (organisation ? 1 : 0) + (periode ? 1 : 0) + (subtitle ? 1 : 0) + 1 + 1;
  const headerRowIdx = headerOffset;
  for (let c = 0; c < columns.length; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIdx, c });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '146C43' } },
        alignment: { horizontal: 'center' },
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ─── PDF Export ──────────────────────────────────────────────────────────────

export async function exportPDF(options: {
  filename: string;
  title: string;
  subtitle?: string;
  organisation?: string;
  periode?: string;
  columns: { header: string; dataKey: string; width?: number }[];
  data: Record<string, unknown>[];
  orientation?: 'portrait' | 'landscape';
}): Promise<void> {
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;

  const {
    filename,
    title,
    subtitle,
    organisation,
    periode,
    columns,
    data,
    orientation = 'portrait',
  } = options;

  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  // ── En-tête ──
  // Bande verte
  doc.setFillColor(20, 108, 67);
  doc.rect(0, 0, pageW, 28, 'F');

  // Logo textuel
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ANOUANZÊ', 14, 12);
  doc.setFontSize(10);
  doc.setTextColor(242, 140, 37);
  doc.text('ERP', 14, 18);

  // Titre du rapport
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageW / 2, 12, { align: 'center' });
  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageW / 2, 19, { align: 'center' });
  }

  // Date à droite
  doc.setFontSize(8);
  doc.setTextColor(200, 240, 215);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-CI')}`, pageW - 14, 12, { align: 'right' });

  y = 35;

  // Infos organisation / période
  if (organisation || periode) {
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (organisation) { doc.text(`Organisation : ${organisation}`, 14, y); y += 5; }
    if (periode) { doc.text(`Période : ${periode}`, 14, y); y += 5; }
    y += 3;
  }

  // ── Tableau ──
  autoTable(doc, {
    startY: y,
    head: [columns.map((c) => c.header)],
    body: data.map((row) =>
      columns.map((col) => {
        const val = col.dataKey.split('.').reduce<unknown>((obj, k) => {
          if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k];
          return undefined;
        }, row);
        return val !== null && val !== undefined ? String(val) : '—';
      }),
    ),
    headStyles: {
      fillColor: [20, 108, 67],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: [240, 250, 244] },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
    columnStyles: Object.fromEntries(
      columns.map((c, i) => [i, { cellWidth: c.width ?? 'auto' }]),
    ),
    margin: { left: 14, right: 14 },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.1,
    didDrawPage: (data: any) => {
      // Pied de page
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = data.pageNumber;
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `ANOUANZÊ ERP — IBIG SARL — Page ${currentPage} / ${pageCount}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' },
      );
      doc.text('ibigsoft.com', 14, doc.internal.pageSize.getHeight() - 8);
    },
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
