# Moteur d'export documentaire universel — ANOUANZÊ ERP

Moteur unique qui transforme n'importe quel jeu de lignes tabulaires en un
document **PDF / XLSX / CSV** propre, sans que le module métier ait à se soucier
du format de page, de l'orientation, des largeurs de colonnes, de la police ou
de la pagination.

Le principe : chaque module décrit **quoi** exporter (`DocumentExportDefinition`),
le moteur décide **comment** le composer.

---

## Architecture

```
pdf-engine/
├── types.ts                 Contrat partagé (ColumnDef, DocumentExportDefinition,
│                            DocumentBranding, bornes de police, cibles d'occupation).
├── column-rules.ts          Règles de dimensionnement par ColumnType (min/max/flex,
│                            alignement, nowrap, priorité) + abréviations d'en-têtes.
├── text-measure.ts          Mesure réelle des textes via jsPDF.getTextWidth (mm),
│                            découpe (wrap) et percentiles. Avec cache.
├── layout-engine.ts         Cœur : analyzeColumns → distribution des largeurs →
│                            hauteurs de lignes → pagination équilibrée → scoring →
│                            selectBestDocumentLayout (teste plusieurs candidats).
├── integrity-validator.ts   Contrôles post-génération (occupation, page quasi vide,
│                            débordement, police sous plancher…).
├── export-definitions.ts    ← CE MODULE : branding ANOUANZÊ + fabriques de
│                            DocumentExportDefinition par module métier + helpers
│                            de formatage (FCFA, date fr-CI, booléen court).
├── index.ts                 Façade publique exportDocument() (créée par l'intégrateur).
└── __tests__/
    └── layout-engine.test.ts  Tests du moteur (section 42).
```

### Flux de composition (résumé)

1. **Mesure** — `createMeasurer(doc)` mesure chaque libellé et un échantillon de
   valeurs à la vraie police (métriques jsPDF, en mm).
2. **Analyse** — `analyzeColumns()` calcule pour chaque colonne largeur naturelle,
   min/max métier, percentiles p90/p95, flex, wrappabilité.
3. **Distribution** — l'espace utile est réparti au prorata du `flex` (borné par
   `max`), puis compression douce des seules colonnes wrappables si nécessaire.
4. **Pagination** — hauteurs de lignes réelles (multi-lignes bornées), répartition
   équilibrée, fusion de la dernière page si elle est quasi vide.
5. **Scoring** — plusieurs candidats (A4 portrait/paysage, compact, A3 paysage)
   sont notés (lisibilité, occupation, remplissage, wrapping, page orpheline) ;
   `selectBestDocumentLayout()` renvoie le meilleur.

---

## Rôle de `export-definitions.ts`

- `ANOUANZE_BRANDING` : branding partagé (nom logiciel, société IBIG SARL,
  couleurs `#146C43` / `#F28C25`, pied `ibigsoft.com`). **Source unique.**
- Fabriques typées, une par module :
  `membresExportDef`, `budgetExportDef`, `comptabiliteExportDef`,
  `tresorerieExportDef` — chacune renvoie une `DocumentExportDefinition` complète.
- Helpers de formatage réutilisables : `formatFCFA`, `formatDateFR`,
  `formatBoolShort`.
- `EXPORT_DEFINITIONS` : index `{ membres, budget, comptabilite, tresorerie }`
  pour une résolution dynamique par clé.

Chaque fabrique accepte `{ organisation?, periode?, filtersSummary? }` (contexte
d'en-tête) et fixe elle-même le `documentType`, les `columns` (avec `type`,
`priority`, `nowrap`, `align`, `abbrevLabel`, `format`).

---

## Comment ajouter un nouvel export en 5 lignes

La façade attendue (dans `index.ts`) :

```ts
// exportDocument(def, rows, format) → déclenche le téléchargement (pdf | xlsx | csv)
export function exportDocument(
  def: DocumentExportDefinition,
  rows: Record<string, unknown>[],
  format: 'pdf' | 'xlsx' | 'csv',
): Promise<void>;
```

### Cas 1 — un module déjà couvert (Membres, Budget, Compta, Trésorerie)

```ts
import { exportDocument } from '@/lib/pdf-engine';
import { membresExportDef } from '@/lib/pdf-engine/export-definitions';

const def = membresExportDef({ organisation: 'ANOUANZÊ', periode: '2024' });
await exportDocument(def, membres, 'pdf'); // ou 'xlsx' / 'csv'
```

### Cas 2 — un tout nouveau module

Déclarez une `DocumentExportDefinition` (réutilisez `ANOUANZE_BRANDING`), puis
appelez la façade :

```ts
import { exportDocument } from '@/lib/pdf-engine';
import { ANOUANZE_BRANDING, formatFCFA, formatDateFR } from '@/lib/pdf-engine/export-definitions';

const def = {
  title: 'Liste des cotisations',
  documentType: 'analytic-report',
  branding: ANOUANZE_BRANDING,
  columns: [
    { key: 'reference', label: 'Réf.',   type: 'reference', nowrap: true },
    { key: 'membre',    label: 'Membre', type: 'name' },
    { key: 'date',      label: 'Date',   type: 'date',   nowrap: true, format: formatDateFR },
    { key: 'montant',   label: 'Montant',type: 'amount', nowrap: true, format: formatFCFA },
  ],
} as const;

await exportDocument(def, cotisations, 'pdf');
```

C'est tout : orientation, largeurs, police, marges et pagination sont calculées
automatiquement par le moteur. On ne décrit jamais de `width` en pixels.

### Bonnes pratiques colonnes

| Donnée              | `type`              | Conseils                                  |
|---------------------|---------------------|-------------------------------------------|
| N° / code           | `reference` / `code`| `nowrap: true`                            |
| Nom / Prénom        | `name` / `firstname`| laisser wrapper                           |
| Email               | `email`             | `flex` élevé, wrappable                    |
| Téléphone           | `phone`             | `nowrap: true`, `abbrevLabel: 'Tél.'`      |
| Date                | `date`              | `nowrap: true`, `format: formatDateFR`     |
| Montant (FCFA)      | `amount`            | `nowrap: true`, `format: formatFCFA`, right|
| Statut              | `status`            | `nowrap: true`                             |
| Oui / Non           | `boolean-short`     | `format: formatBoolShort`                  |
| Libellé long        | `long-description`  | wrappable, `flex` élevé                     |

Le moteur ne **supprime jamais** une colonne : si l'espace manque, les colonnes
`optional`/`secondary` peuvent partir en annexe, jamais les `essential`.

---

## Tests

Aucun runner (Jest/Vitest) n'est configuré dans `apps/web/package.json`.
`__tests__/layout-engine.test.ts` est écrit en **syntaxe Vitest** mais embarque un
micro-harnais local pour :

- **compiler proprement** sous `npx tsc --noEmit` sans installer `vitest` ;
- **s'exécuter immédiatement** sans dépendance :
  ```bash
  cd apps/web && npx tsx src/lib/pdf-engine/__tests__/layout-engine.test.ts
  ```

Pour passer à Vitest : `npm i -D vitest`, supprimer le bloc « MICRO-HARNAIS »,
ajouter `import { describe, it, expect } from 'vitest';` et le script
`"test": "vitest run"`.

Couverture : jeux de 1 à 500 lignes × 4/8/15 colonnes, valeurs courtes/longues,
accents et apostrophes ; invariants sur largeurs (≥ min de type), somme des
largeurs (≤ largeur utile), occupation (≥ 0.85 quand assez de contenu), police
body (≥ 7.5), orientation pilotée par le contenu, et équilibrage de la dernière
page.
