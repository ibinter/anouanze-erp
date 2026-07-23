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
 * Conséquence : un contexte non pertinent était injecté dans le prompt système,
 * ce qui augmentait le risque d'hallucination sur une question hors périmètre.
 *
 * ✅ CORRIGÉ : `searchKnowledge` compare désormais sur des MOTS ENTIERS
 * (`new Set(normalizedContent.split(' '))`) et applique un score plancher
 * (`MIN_RELEVANCE_SCORE = 4`) avant de retenir un passage.
 *
 * Les tests ci-dessous verrouillent le comportement CORRIGÉ : une question
 * hors-sujet ne doit plus remonter aucun passage, et la règle 10 des
 * garde-fous (« reconnaître qu'une information manque ») s'applique.
 * ────────────────────────────────────────────────────────────────────────────
 */
describe('faux positifs par sous-chaîne (régression)', () => {
  it('« Qui a gagné la finale de football hier soir ? » ne remonte aucun passage', () => {
    expect(searchKnowledge('Qui a gagné la finale de football hier soir ?')).toEqual([]);
  });

  it('« Donne-moi le cours du bitcoin. » ne remonte aucun passage', () => {
    expect(searchKnowledge('Donne-moi le cours du bitcoin.')).toEqual([]);
  });

  it('le plancher filtre le bruit sans écarter les vraies questions métier', () => {
    const bruit = [
      ...searchKnowledge('Qui a gagné la finale de football hier soir ?'),
      ...searchKnowledge('Donne-moi le cours du bitcoin.'),
      ...searchKnowledge('Quelle est la capitale du Japon ?'),
    ];
    expect(bruit).toEqual([]);

    // …alors que les vraies questions métier restent servies.
    for (const question of [
      'Combien coûte le plan Pro ?',
      'Puis-je essayer gratuitement ?',
      'Comment migrer mes fichiers Excel ?',
    ]) {
      const r = searchKnowledge(question);
      expect(r.length).toBeGreaterThan(0);
      expect(r[0].score).toBeGreaterThanOrEqual(4);
    }
  });

  it('buildKnowledgeContext renvoie une chaîne vide hors périmètre', () => {
    expect(buildKnowledgeContext('Qui a gagné la finale de football hier soir ?')).toBe('');
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
