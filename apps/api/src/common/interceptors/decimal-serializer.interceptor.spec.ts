/**
 * ============================================================================
 * TESTS DU CORRECTIF RACINE DE SÉRIALISATION NUMÉRIQUE (section 42)
 * ----------------------------------------------------------------------------
 * C'est le test le plus important de l'API : sans cet intercepteur, tous les
 * champs `Decimal` de Prisma sortent en CHAÎNES JSON ("22000000") et le front
 * les CONCATÈNE au lieu de les additionner
 * (« 22 000 000 850 000 015 000 000 » sur les KPI du tableau de bord).
 *
 * On simule les objets Decimal (la vraie classe Prisma n'est pas requise : le
 * test reproduit fidèlement son contrat — `constructor.name === 'Decimal'`,
 * propriété interne `d`, méthodes `toNumber()` / `toString()`).
 * ============================================================================
 */
import { of, lastValueFrom } from 'rxjs';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { DecimalSerializerInterceptor } from './decimal-serializer.interceptor';

/** Réplique minimale du contrat Prisma.Decimal. */
class Decimal {
  // `d` = mantisse interne, présente sur les vrais Decimal de decimal.js
  readonly d: number[];
  constructor(private readonly value: number) {
    this.d = [value];
  }
  toNumber(): number {
    return this.value;
  }
  toString(): string {
    return String(this.value);
  }
}

const interceptor = new DecimalSerializerInterceptor();
const ctx = {} as ExecutionContext;

/** Fait passer une charge utile à travers l'intercepteur. */
async function through<T = any>(payload: unknown): Promise<T> {
  const next: CallHandler = { handle: () => of(payload) };
  return lastValueFrom(interceptor.intercept(ctx, next)) as Promise<T>;
}

describe('DecimalSerializerInterceptor', () => {
  describe('Decimal Prisma', () => {
    it('convertit un Decimal racine en number', async () => {
      const out = await through(new Decimal(22000000));
      expect(out).toBe(22000000);
      expect(typeof out).toBe('number');
    });

    it('convertit un Decimal imbriqué dans un objet', async () => {
      const out = await through({ id: 'a1', solde: new Decimal(22000000) });
      expect(out).toEqual({ id: 'a1', solde: 22000000 });
      expect(typeof out.solde).toBe('number');
    });

    it('convertit les Decimal d’un tableau', async () => {
      const out = await through([new Decimal(1000), new Decimal(2500.75)]);
      expect(out).toEqual([1000, 2500.75]);
    });

    it('convertit les Decimal d’un tableau imbriqué dans un objet', async () => {
      const out = await through({
        total: new Decimal(37850000),
        lignes: [
          { libelle: 'Cotisations', montant: new Decimal(22000000) },
          { libelle: 'Dons', montant: new Decimal(850000) },
          { libelle: 'Subventions', montant: new Decimal(15000000) },
        ],
      });
      expect(out.total).toBe(37850000);
      expect(out.lignes.map((l: any) => l.montant)).toEqual([22000000, 850000, 15000000]);
      // invariant anti-concaténation : la somme des lignes est bien numérique
      const somme = out.lignes.reduce((s: number, l: any) => s + l.montant, 0);
      expect(somme).toBe(37850000);
    });

    it('convertit un objet profond (5 niveaux)', async () => {
      const out = await through({
        a: { b: { c: { d: { montant: new Decimal(42) } } } },
      });
      expect(out.a.b.c.d.montant).toBe(42);
    });

    it('convertit une matrice (tableaux de tableaux)', async () => {
      const out = await through([[new Decimal(1)], [[new Decimal(2)]]]);
      expect(out).toEqual([[1], [[2]]]);
    });

    it('accepte un Decimal identifié uniquement par sa propriété interne `d`', async () => {
      const faux = { d: [7], toNumber: () => 7, toString: () => '7' };
      expect(await through({ montant: faux })).toEqual({ montant: 7 });
    });

    it('retombe sur toString() si toNumber() ne renvoie pas un nombre fini', async () => {
      const infini = {
        d: [1],
        toNumber: () => Number.POSITIVE_INFINITY,
        toString: () => '1234',
        constructor: { name: 'Decimal' },
      };
      expect(await through({ montant: infini })).toEqual({ montant: 1234 });
    });
  });

  describe('BigInt', () => {
    it('convertit un BigInt racine', async () => {
      expect(await through(BigInt('9007199254740991'))).toBe(9007199254740991);
    });

    it('convertit les BigInt imbriqués et en tableau', async () => {
      const out = await through({ count: BigInt(12), ids: [BigInt(1), BigInt(2)] });
      expect(out).toEqual({ count: 12, ids: [1, 2] });
      expect(typeof out.count).toBe('number');
    });
  });

  describe('types laissés intacts', () => {
    it('préserve les Date (même instance, non désassemblée)', async () => {
      const d = new Date('2026-07-23T10:00:00.000Z');
      const out = await through({ creeLe: d });
      expect(out.creeLe).toBeInstanceOf(Date);
      expect(out.creeLe.toISOString()).toBe('2026-07-23T10:00:00.000Z');
    });

    it('préserve null et undefined', async () => {
      expect(await through(null)).toBeNull();
      expect(await through(undefined)).toBeUndefined();
      expect(await through({ a: null, b: undefined })).toEqual({ a: null, b: undefined });
    });

    it('préserve chaînes, booléens et nombres', async () => {
      const payload = { nom: 'Kouassi', actif: true, inactif: false, age: 42, zero: 0, vide: '' };
      expect(await through(payload)).toEqual(payload);
    });

    it('ne transforme PAS une chaîne numérique en nombre', async () => {
      const out = await through({ reference: '22000000' });
      expect(out.reference).toBe('22000000');
      expect(typeof out.reference).toBe('string');
    });

    it('préserve un Buffer', async () => {
      const buf = Buffer.from('anouanze');
      const out = await through({ fichier: buf });
      expect(Buffer.isBuffer(out.fichier)).toBe(true);
      expect(out.fichier.toString()).toBe('anouanze');
    });

    it('préserve un tableau vide et un objet vide', async () => {
      expect(await through([])).toEqual([]);
      expect(await through({})).toEqual({});
    });
  });

  describe('robustesse', () => {
    it('conserve le prototype des instances de classe métier', async () => {
      class Dto {
        constructor(public montant: any, public libelle: string) {}
      }
      const out = await through(new Dto(new Decimal(500), 'Cotisation'));
      expect(out).toBeInstanceOf(Dto);
      expect(out.montant).toBe(500);
      expect(out.libelle).toBe('Cotisation');
    });

    it('ne boucle pas indéfiniment sur une structure circulaire', async () => {
      const a: any = { montant: new Decimal(10) };
      a.self = a;
      await expect(through(a)).resolves.toBeDefined();
    });

    it('gère une réponse paginée typique de l’ERP', async () => {
      const out = await through({
        data: [
          { id: '1', nom: 'Kouassi', cotisation: new Decimal(25000), soldes: { du: new Decimal(0) } },
          { id: '2', nom: "N'Dri", cotisation: new Decimal(50000), soldes: { du: new Decimal(12500) } },
        ],
        meta: { total: BigInt(2), page: 1, montantTotal: new Decimal(75000) },
      });
      expect(out.meta.total).toBe(2);
      expect(out.meta.montantTotal).toBe(75000);
      const somme = out.data.reduce((s: number, m: any) => s + m.cotisation, 0);
      expect(somme).toBe(75000);
      expect(out.data[1].soldes.du).toBe(12500);
    });
  });
});
