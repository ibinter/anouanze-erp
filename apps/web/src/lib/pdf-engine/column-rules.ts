/**
 * Règles de dimensionnement par type de colonne (sections 5, 9, 10, 11).
 * Unité : millimètres. Valeurs calibrées pour du texte 8–9 pt.
 */
import type { ColumnType, ColumnPriority, ColumnAlign } from './types';

export interface ColumnRule {
  min: number;   // largeur minimale métier (mm)
  max: number;   // largeur maximale (mm)
  flex: number;  // poids de distribution de l'espace libre
  align: ColumnAlign;
  nowrap: boolean;
  defaultPriority: ColumnPriority;
}

export const COLUMN_RULES: Record<ColumnType, ColumnRule> = {
  id:                { min: 16, max: 26, flex: 1,   align: 'left',   nowrap: true,  defaultPriority: 'essential' },
  reference:         { min: 24, max: 40, flex: 1.2, align: 'left',   nowrap: true,  defaultPriority: 'essential' },
  name:              { min: 22, max: 46, flex: 2,   align: 'left',   nowrap: false, defaultPriority: 'essential' },
  firstname:         { min: 20, max: 40, flex: 2,   align: 'left',   nowrap: false, defaultPriority: 'essential' },
  email:             { min: 38, max: 72, flex: 3,   align: 'left',   nowrap: false, defaultPriority: 'important' },
  phone:             { min: 26, max: 38, flex: 1,   align: 'left',   nowrap: true,  defaultPriority: 'important' },
  date:              { min: 20, max: 26, flex: 0.7, align: 'center', nowrap: true,  defaultPriority: 'essential' },
  datetime:          { min: 30, max: 40, flex: 0.9, align: 'center', nowrap: true,  defaultPriority: 'important' },
  amount:            { min: 22, max: 38, flex: 1,   align: 'right',  nowrap: true,  defaultPriority: 'essential' },
  percent:           { min: 16, max: 24, flex: 0.6, align: 'right',  nowrap: true,  defaultPriority: 'secondary' },
  status:            { min: 20, max: 34, flex: 0.9, align: 'center', nowrap: true,  defaultPriority: 'essential' },
  code:              { min: 18, max: 32, flex: 0.9, align: 'left',   nowrap: true,  defaultPriority: 'important' },
  'short-code':      { min: 14, max: 22, flex: 0.5, align: 'center', nowrap: true,  defaultPriority: 'important' },
  boolean:           { min: 16, max: 24, flex: 0.5, align: 'center', nowrap: true,  defaultPriority: 'secondary' },
  'boolean-short':   { min: 12, max: 18, flex: 0.4, align: 'center', nowrap: true,  defaultPriority: 'essential' },
  'short-description':{ min: 34, max: 70, flex: 3,  align: 'left',   nowrap: false, defaultPriority: 'secondary' },
  'long-description': { min: 46, max: 100, flex: 4, align: 'left',   nowrap: false, defaultPriority: 'secondary' },
  list:              { min: 30, max: 60, flex: 2.5, align: 'left',   nowrap: false, defaultPriority: 'secondary' },
  'free-text':       { min: 40, max: 90, flex: 4,   align: 'left',   nowrap: false, defaultPriority: 'secondary' },
};

/**
 * Abréviations centralisées (section 11) — FR puis EN.
 * Utilisées uniquement si l'espace impose le header abrégé.
 */
export const HEADER_ABBREVIATIONS: Record<string, string> = {
  'groupe sanguin': 'Groupe',
  'téléphone': 'Tél.',
  'telephone': 'Tél.',
  'numéro de demande': 'N° demande',
  'numero de demande': 'N° demande',
  'date de naissance': 'Naissance',
  'date d\'adhésion': 'Adhésion',
  'date adhesion': 'Adhésion',
  'phone number': 'Phone',
  'date of birth': 'Birth',
  'reference': 'Réf.',
  'référence': 'Réf.',
  'pourcentage': '%',
  'quantité': 'Qté',
  'quantite': 'Qté',
};

export function abbreviate(label: string): string {
  return HEADER_ABBREVIATIONS[label.trim().toLowerCase()] ?? label;
}

/** Priorité effective d'une colonne (override module > défaut du type). */
export function effectivePriority(
  priority: ColumnPriority | undefined,
  type: ColumnType,
): ColumnPriority {
  return priority ?? COLUMN_RULES[type].defaultPriority;
}

/** Ordre de sacrifice quand l'espace manque : optional d'abord. */
export const PRIORITY_ORDER: ColumnPriority[] = ['optional', 'secondary', 'important', 'essential'];
