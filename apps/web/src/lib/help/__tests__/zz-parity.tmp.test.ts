import { describe, it, expect } from 'vitest';
import { GUIDE_MODULES } from '@/lib/help/guide';
import { GUIDE_MODULES_EN } from '@/lib/help/guide.en';
import { CAS_PRATIQUES } from '@/lib/help/cas-pratiques';
import { CAS_PRATIQUES_EN } from '@/lib/help/cas-pratiques.en';
import { PARCOURS, RESSOURCES } from '@/lib/help/academie';
import { PARCOURS_EN, RESSOURCES_EN } from '@/lib/help/academie.en';
import { FAQ_ITEMS } from '@/lib/help/faq';
import { FAQ_ITEMS_EN } from '@/lib/help/faq.en';

describe('parité FR/EN', () => {
  it('guide', () => {
    expect(GUIDE_MODULES_EN.map((m) => m.id)).toEqual(GUIDE_MODULES.map((m) => m.id));
    expect(GUIDE_MODULES_EN.map((m) => m.categorie)).toEqual(GUIDE_MODULES.map((m) => m.categorie));
    expect(GUIDE_MODULES_EN.map((m) => m.href)).toEqual(GUIDE_MODULES.map((m) => m.href));
  });
  it('cas', () => {
    expect(CAS_PRATIQUES_EN.map((c) => c.id)).toEqual(CAS_PRATIQUES.map((c) => c.id));
    expect(CAS_PRATIQUES_EN.map((c) => c.niveau)).toEqual(CAS_PRATIQUES.map((c) => c.niveau));
    expect(CAS_PRATIQUES_EN.map((c) => c.dureeMinutes)).toEqual(CAS_PRATIQUES.map((c) => c.dureeMinutes));
  });
  it('academie', () => {
    expect(PARCOURS_EN.map((p) => p.id)).toEqual(PARCOURS.map((p) => p.id));
    expect(PARCOURS_EN.map((p) => p.categorie)).toEqual(PARCOURS.map((p) => p.categorie));
    expect(PARCOURS_EN.flatMap((p) => p.lecons.map((l) => l.id))).toEqual(
      PARCOURS.flatMap((p) => p.lecons.map((l) => l.id)),
    );
    expect(PARCOURS_EN.flatMap((p) => p.lecons.map((l) => l.dureeMinutes))).toEqual(
      PARCOURS.flatMap((p) => p.lecons.map((l) => l.dureeMinutes)),
    );
    expect(PARCOURS_EN.flatMap((p) => p.lecons.map((l) => l.disponible))).toEqual(
      PARCOURS.flatMap((p) => p.lecons.map((l) => l.disponible)),
    );
    expect(PARCOURS_EN.flatMap((p) => p.lecons.map((l) => l.lienInterne))).toEqual(
      PARCOURS.flatMap((p) => p.lecons.map((l) => l.lienInterne)),
    );
    expect(RESSOURCES_EN.map((r) => [r.id, r.type, r.href, r.disponible])).toEqual(
      RESSOURCES.map((r) => [r.id, r.type, r.href, r.disponible]),
    );
  });
  it('faq', () => {
    expect(FAQ_ITEMS_EN.map((f) => f.id)).toEqual(FAQ_ITEMS.map((f) => f.id));
  });
  it('aucun texte français résiduel évident dans les EN', () => {
    const blob = JSON.stringify([GUIDE_MODULES_EN, CAS_PRATIQUES_EN, PARCOURS_EN, RESSOURCES_EN]);
    for (const mot of [' le ', ' la ', ' les ', ' des ', ' vous ', ' pour la ']) {
      expect(blob.toLowerCase()).not.toContain(mot);
    }
  });
});
