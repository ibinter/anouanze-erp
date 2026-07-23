/**
 * ============================================================================
 * TESTS DE LA BASE DE CONNAISSANCES SARA (RAG léger) — section 42
 * ----------------------------------------------------------------------------
 * Exigence forte : une question HORS-SUJET ne doit remonter AUCUN passage.
 * Injecter un passage non pertinent pousserait le modèle à halluciner en
 * s'appuyant sur des tarifs ou des modules sans rapport avec la question.
 * ============================================================================
 */
import { describe, it, expect } from 'vitest';
import { searchKnowledge, buildKnowledgeContext, KNOWLEDGE_BASE } from '../knowledge';

describe('KNOWLEDGE_BASE — intégrité', () => {
  it('contient des entrées toutes identifiées de façon unique', () => {
    expect(KNOWLEDGE_BASE.length).toBeGreaterThan(0);
    const ids = KNOWLEDGE_BASE.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('chaque entrée a un titre, une source citable, des mots-clés et du contenu', () => {
    for (const e of KNOWLEDGE_BASE) {
      expect(e.title.trim().length).toBeGreaterThan(0);
      expect(e.source.trim().length).toBeGreaterThan(0);
      expect(e.keywords.length).toBeGreaterThan(0);
      expect(e.content.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('searchKnowledge — pertinence', () => {
  it('une question sur les prix remonte le passage « tarifs » en tête', () => {
    const r = searchKnowledge('Combien coûte le plan Pro ?');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].entry.id).toBe('tarifs');
  });

  it('une question sur la conformité remonte SYCEBNL/OHADA', () => {
    const r = searchKnowledge('Est-ce conforme au référentiel SYCEBNL OHADA ?');
    expect(r.map((s) => s.entry.id)).toContain('conformite');
  });

  it('une question sur l’essai gratuit remonte le passage « essai »', () => {
    const r = searchKnowledge('Puis-je tester gratuitement pendant 30 jours ?');
    expect(r.map((s) => s.entry.id)).toContain('essai');
  });

  it('une question sur les contacts remonte IBIG SOFT', () => {
    const r = searchKnowledge('Comment vous contacter par téléphone ?');
    expect(r.map((s) => s.entry.id)).toContain('contact');
  });

  it('les scores sont strictement positifs et triés par ordre décroissant', () => {
    const r = searchKnowledge('modules et tarifs de la solution');
    expect(r.length).toBeGreaterThan(0);
    for (const s of r) expect(s.score).toBeGreaterThan(0);
    const scores = r.map((s) => s.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('respecte la limite de passages demandée', () => {
    expect(searchKnowledge('tarifs modules securite sycebnl contact', 1).length).toBeLessThanOrEqual(1);
    expect(searchKnowledge('tarifs modules securite sycebnl contact', 3).length).toBeLessThanOrEqual(3);
  });

  it('est insensible à la casse, aux accents et à la ponctuation', () => {
    const a = searchKnowledge('SÉCURITÉ des données ?!');
    const b = searchKnowledge('securite des donnees');
    expect(a.map((s) => s.entry.id)).toEqual(b.map((s) => s.entry.id));
  });
});

describe('searchKnowledge — silence sur le hors-sujet (exigence anti-hallucination)', () => {
  const horsSujet = [
    'Quelle est la recette du foutou banane ?',
    'Traduis ce poème en latin.',
    'zzzqwx plokm vbnhy',
  ];

  for (const q of horsSujet) {
    it(`aucun passage pour : « ${q} »`, () => {
      expect(searchKnowledge(q)).toEqual([]);
      expect(buildKnowledgeContext(q)).toBe('');
    });
  }

  it('renvoie [] pour une requête vide ou uniquement ponctuation', () => {
    expect(searchKnowledge('')).toEqual([]);
    expect(searchKnowledge('   ')).toEqual([]);
    expect(searchKnowledge('??? !!! ...')).toEqual([]);
  });

  it('renvoie [] pour une requête composée uniquement de mots vides', () => {
    expect(searchKnowledge('le la les de du et ou')).toEqual([]);
  });
});

/**
 * ────────────────────────────────────────────────────────────────────────────
 * BUG RÉEL DÉTECTÉ PAR CETTE SUITE — faux positifs de recherche
 * ----------------------------------------------------------------------------
 * `searchKnowledge` teste l'appartenance d'un token au contenu avec
 * `normalizedContent.includes(token)` : une SOUS-CHAÎNE suffit, sans frontière
 * de mot. Des questions totalement hors-sujet obtiennent donc un score > 0 :
 *   « hier »  ⊂ « fic-HIER-s »        → passage « bénéfices »
 *   « moi »   ⊂ « -MOI-s »            → passage « tarifs »
 *   « donne » ⊂ « -DONNE-es »         → passages « sécurité », « migration »
 *   « gagne » ⊂ « -GAGNE-r du temps » → passage « bénéfices »
 * `sharePrefix` (racine commune ≥ 4 caractères) amplifie l'effet côté keywords.
 *
 * Conséquence : un contexte non pertinent est injecté dans le prompt système,
 * ce qui augmente le risque d'hallucination sur une question hors périmètre.
 * Correctif suggéré (NON appliqué — hors périmètre de cette mission) :
 * comparer sur des mots entiers (`new Set(normalizedContent.split(' '))`) et
 * exiger un score plancher (≥ 3) avant d'injecter un passage.
 *
 * Les tests ci-dessous VERROUILLENT le comportement actuel afin que le jour où
 * le correctif est appliqué, ils échouent et signalent explicitement le
 * changement — ils ne masquent pas le défaut, ils le documentent.
 * ────────────────────────────────────────────────────────────────────────────
 */
describe('[BUG CONNU] faux positifs par sous-chaîne', () => {
  it('« Qui a gagné la finale de football hier soir ? » remonte à tort un passage', () => {
    const r = searchKnowledge('Qui a gagné la finale de football hier soir ?');
    expect(r.length).toBeGreaterThan(0); // ← devrait être 0
    expect(r[0].entry.id).toBe('benefices');
    expect(r[0].score).toBeLessThanOrEqual(2); // score résiduel très faible
  });

  it('« Donne-moi le cours du bitcoin. » remonte à tort des passages', () => {
    const r = searchKnowledge('Donne-moi le cours du bitcoin.');
    expect(r.length).toBeGreaterThan(0); // ← devrait être 0
    expect(r.every((s) => s.score <= 3)).toBe(true);
  });

  it('un score plancher de 4 suffirait à filtrer ces faux positifs', () => {
    const bruit = [
      ...searchKnowledge('Qui a gagné la finale de football hier soir ?'),
      ...searchKnowledge('Donne-moi le cours du bitcoin.'),
    ];
    expect(bruit.filter((s) => s.score >= 4)).toEqual([]);
    // …alors qu'une vraie question métier dépasse largement ce seuil.
    expect(searchKnowledge('Combien coûte le plan Pro ?')[0].score).toBeGreaterThanOrEqual(4);
  });
});

describe('buildKnowledgeContext', () => {
  it('produit un bloc contenant le contenu et la source citable', () => {
    const ctx = buildKnowledgeContext('Quels sont vos tarifs ?');
    expect(ctx.length).toBeGreaterThan(0);
    expect(ctx).toContain('INFORMATIONS OFFICIELLES PERTINENTES');
    expect(ctx).toContain('Source :');
    expect(ctx).toContain('59 900 FCFA');
  });

  it('renvoie une chaîne vide si aucun passage pertinent', () => {
    expect(buildKnowledgeContext('recette de cuisine ivoirienne')).toBe('');
  });

  it('n’injecte jamais plus de passages que la limite', () => {
    const ctx = buildKnowledgeContext('tarifs modules securite contact essai', 2);
    expect(ctx.split('### ').length - 1).toBeLessThanOrEqual(2);
  });
});
