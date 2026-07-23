/**
 * ============================================================================
 * TESTS DE NON-RÉGRESSION — coercition numérique (section 42)
 * ----------------------------------------------------------------------------
 * `toNum()` est la fonction qui a corrigé la corruption numérique globale de
 * l'ERP : les champs `Decimal` de Prisma arrivaient côté front sous forme de
 * CHAÎNES ("22000000") et `+` les CONCATÉNAIT au lieu de les additionner
 * (« 22 000 000 850 000 015 000 000 » sur les KPI).
 *
 * Ces tests verrouillent le comportement : toute valeur non exploitable doit
 * retomber sur 0, JAMAIS sur NaN ni sur une concaténation.
 * ============================================================================
 */
import { describe, it, expect } from 'vitest';
import { toNum, formatMontant, formatDate, initiales, truncate, cn } from '../utils';

describe('toNum — nombres natifs', () => {
  it('renvoie le nombre inchangé', () => {
    expect(toNum(0)).toBe(0);
    expect(toNum(42)).toBe(42);
    expect(toNum(-1250.75)).toBe(-1250.75);
    expect(toNum(22_000_000)).toBe(22_000_000);
  });

  it('neutralise NaN et les infinis (jamais de NaN propagé)', () => {
    expect(toNum(Number.NaN)).toBe(0);
    expect(toNum(Number.POSITIVE_INFINITY)).toBe(0);
    expect(toNum(Number.NEGATIVE_INFINITY)).toBe(0);
  });
});

describe('toNum — chaînes (cas Decimal Prisma sérialisé)', () => {
  it('convertit une chaîne numérique simple', () => {
    expect(toNum('22000000')).toBe(22000000);
    expect(toNum('0')).toBe(0);
    expect(toNum('-350')).toBe(-350);
  });

  it('gère les décimales Prisma ("1500.50")', () => {
    expect(toNum('1500.50')).toBe(1500.5);
    expect(toNum('0.000001')).toBe(0.000001);
  });

  it('gère la notation scientifique', () => {
    expect(toNum('1e6')).toBe(1000000);
  });

  it('supprime les espaces (y compris insécables) des montants formatés', () => {
    expect(toNum('22 000 000')).toBe(22000000);
    expect(toNum(' 1 250 ')).toBe(1250);
    expect(toNum(' 850 000')).toBe(850000);
  });

  it('accepte la virgule décimale française', () => {
    expect(toNum('1500,50')).toBe(1500.5);
    expect(toNum('12 345,67')).toBe(12345.67);
  });

  it('renvoie 0 pour une chaîne vide ou blanche', () => {
    expect(toNum('')).toBe(0);
    expect(toNum('   ')).toBe(0);
  });

  it('renvoie 0 pour une chaîne non numérique (jamais NaN)', () => {
    expect(toNum('abc')).toBe(0);
    expect(toNum('12 000 FCFA')).toBe(0);
    expect(toNum('Infinity')).toBe(0);
    expect(toNum('NaN')).toBe(0);
  });

  /**
   * LIMITE CONNUE (documentée, non corrigée ici) : `replace(',', '.')` ne
   * remplace que la PREMIÈRE virgule. Une chaîne au format anglo-saxon avec
   * séparateurs de milliers ("1,234,567") retombe donc sur 0 plutôt que sur
   * 1234567. Ce n'est pas un chemin réel de l'ERP (Prisma sérialise en brut
   * "1234567"), mais le comportement est verrouillé ici pour éviter toute
   * dérive silencieuse. Voir RAPPORT_TESTS.md.
   */
  it('[limite connue] séparateurs de milliers anglo-saxons → 0', () => {
    expect(toNum('1,234,567')).toBe(0);
  });
});

describe('toNum — types non numériques', () => {
  it('renvoie 0 pour null / undefined', () => {
    expect(toNum(null)).toBe(0);
    expect(toNum(undefined)).toBe(0);
  });

  it('renvoie 0 pour booléens, objets, tableaux et fonctions', () => {
    expect(toNum(true)).toBe(0);
    expect(toNum(false)).toBe(0);
    expect(toNum({})).toBe(0);
    expect(toNum([])).toBe(0);
    expect(toNum([1, 2])).toBe(0);
    expect(toNum(() => 5)).toBe(0);
    expect(toNum(Symbol('x'))).toBe(0);
  });

  /**
   * Un objet Decimal Prisma NON sérialisé (avec .toNumber()) retombe sur 0
   * côté front. C'est acceptable : le DecimalSerializerInterceptor de l'API
   * convertit ces objets en nombre AVANT la sortie HTTP (voir apps/api).
   */
  it('[limite connue] objet Decimal brut (non sérialisé) → 0', () => {
    expect(toNum({ toNumber: () => 22000000 })).toBe(0);
  });
});

describe('toNum — invariant anti-concaténation', () => {
  it("une somme de chaînes reste une addition, jamais une concaténation", () => {
    const montantsApi = ['22000000', '850000', '15000000'];
    const total = montantsApi.reduce((acc, v) => acc + toNum(v), 0);
    expect(total).toBe(37850000);
    expect(typeof total).toBe('number');
  });

  it('un jeu hétérogène (null, chaîne, nombre, undefined) somme correctement', () => {
    const mixte: unknown[] = ['1000', 2000, null, undefined, '3 000', '', 'N/A'];
    const total = mixte.reduce<number>((acc, v) => acc + toNum(v), 0);
    expect(total).toBe(6000);
  });
});

describe('formatMontant', () => {
  it('coerce sans planter sur null / undefined / NaN', () => {
    expect(() => formatMontant(null)).not.toThrow();
    expect(() => formatMontant(undefined)).not.toThrow();
    expect(() => formatMontant(Number.NaN)).not.toThrow();
    expect(formatMontant(null)).toContain('0');
    expect(formatMontant(undefined)).toContain('0');
  });

  it('formate une chaîne Decimal comme le nombre équivalent', () => {
    expect(formatMontant('22000000')).toBe(formatMontant(22000000));
  });

  it('ne contient jamais « NaN »', () => {
    const entrees: unknown[] = [null, undefined, Number.NaN, 'abc', {}, [], true];
    for (const e of entrees) {
      expect(formatMontant(e as number)).not.toContain('NaN');
    }
  });

  it('affiche la devise demandée', () => {
    expect(formatMontant(1000, 'XOF')).toMatch(/(XOF|F CFA|FCFA|CFA)/);
    expect(formatMontant(1000, 'EUR')).toContain('€');
    expect(formatMontant(1000, 'USD')).toContain('$');
  });

  it('arrondit sans décimales (montants entiers)', () => {
    expect(formatMontant(1500.6)).not.toContain(',6');
  });

  it("retombe sur la locale par défaut pour une devise inconnue mais valide (ISO)", () => {
    expect(() => formatMontant(1000, 'GHS')).not.toThrow();
  });
});

describe('formatDate', () => {
  it('formate une date ISO au format jj/mm/aaaa', () => {
    expect(formatDate('2026-03-14T10:00:00.000Z')).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('accepte un objet Date', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('05/01/2026');
  });

  it('respecte les options surchargées', () => {
    const out = formatDate(new Date(2026, 0, 5), { month: 'long' });
    expect(out.toLowerCase()).toContain('janvier');
  });
});

describe('initiales', () => {
  it('concatène les premières lettres en majuscules', () => {
    expect(initiales('kouassi', 'aya')).toBe('KA');
    expect(initiales('Koffi')).toBe('K');
  });

  it('gère les accents et les chaînes vides', () => {
    expect(initiales('Éloi', 'ébène')).toBe('ÉÉ');
    expect(initiales('')).toBe('');
  });
});

describe('truncate', () => {
  it('laisse intacte une chaîne plus courte que la limite', () => {
    expect(truncate('Cotisation', 20)).toBe('Cotisation');
    expect(truncate('exact', 5)).toBe('exact');
  });

  it('tronque et suffixe par « ... » sans dépasser la limite', () => {
    const out = truncate('Cotisation annuelle des membres', 15);
    expect(out.length).toBe(15);
    expect(out.endsWith('...')).toBe(true);
  });
});

describe('cn (fusion de classes Tailwind)', () => {
  it('fusionne et déduplique les classes conflictuelles', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('ignore les valeurs falsy', () => {
    expect(cn('flex', false && 'hidden', undefined, null)).toBe('flex');
  });
});
