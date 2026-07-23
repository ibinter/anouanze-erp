# RAPPORT DE TESTS — ANOUANZÊ ERP

> Section 42 du cahier des charges IBIG SOFT — suite de tests automatisés.
> Dernière exécution : **227 tests, 227 réussis, 0 échec**.

---

## 1. Runners configurés

| Application | Runner | Version | Script | Environnement |
|---|---|---|---|---|
| `apps/web` (Next.js 14) | **Vitest** | 2.1.9 | `npm test` → `vitest run` | `node` (pas de jsdom : toute la logique testée est pure) |
| `apps/api` (NestJS) | **Jest + ts-jest** | 29.x | `npm test` → `jest` | `node` |

Fichiers de configuration :

- `apps/web/vitest.config.ts` — nouveau. Alias `@/…` aligné sur `tsconfig.json`, motif
  d'inclusion `src/**/__tests__/**/*.test.ts`.
- `apps/api/package.json` — bloc `"jest"` ajouté (`rootDir: src`, `testRegex: .*\.spec\.ts$`,
  transform `ts-jest`). Le script `"test": "jest"` existait déjà mais n'était rattaché à aucune
  configuration : aucun test ne pouvait s'exécuter.

Dépendances de développement ajoutées (strict minimum) :

- `apps/web` : `vitest@^2`
- `apps/api` : `@types/jest@^29` (`jest` et `ts-jest` étaient déjà déclarés)

### Migration de la suite existante

`apps/web/src/lib/pdf-engine/__tests__/layout-engine.test.ts` embarquait un **micro-harnais
maison** imitant l'API Vitest (`describe`/`it`/`expect` réimplémentés à la main) et se lançait
via `npx tsx`. Ce harnais a été supprimé et remplacé par `import { describe, it, expect } from 'vitest'`.
**Les 73 tests d'origine passent à l'identique** ; aucun corps de test n'a été modifié.

---

## 2. Comment lancer la suite

```bash
# Front (192 tests, ~16 s)
cd apps/web && npm test
cd apps/web && npm run test:watch     # mode watch

# API (35 tests, ~80 s)
cd apps/api && npm test
cd apps/api && npx jest --coverage     # avec couverture

# Un seul fichier
cd apps/web && npx vitest run src/lib/__tests__/utils.test.ts
cd apps/api  && npx jest src/common/interceptors
```

⚠️ **Ne pas utiliser `npm test` à la racine.** La tâche `test` de `turbo.json` déclare
`"dependsOn": ["^build"]`, ce qui déclenche un `next build` complet avant les tests. Lancez les
deux suites application par application (commandes ci-dessus) tant que cette dépendance n'a pas
été retirée.

---

## 3. Nombre de tests par domaine

### `apps/web` — 192 tests (Vitest)

| Domaine | Fichier | Tests |
|---|---|---:|
| Moteur de mise en page PDF | `src/lib/pdf-engine/__tests__/layout-engine.test.ts` | 73 |
| Intégrité PDF, mesure de texte, règles de colonnes | `src/lib/pdf-engine/__tests__/integrity-validator.test.ts` | 35 |
| Utilitaires numériques & formatage | `src/lib/__tests__/utils.test.ts` | 30 |
| SARA — base de connaissances (RAG) | `src/lib/sara/__tests__/knowledge.test.ts` | 20 |
| SARA — garde-fous & quotas | `src/lib/sara/__tests__/guardrails.test.ts` | 18 |
| Centre d'aide — recherche plein texte | `src/lib/help/__tests__/recherche.test.ts` | 16 |
| **Total** | | **192** |

### `apps/api` — 35 tests (Jest)

| Domaine | Fichier | Tests |
|---|---|---:|
| Sérialisation numérique (Decimal / BigInt) | `src/common/interceptors/decimal-serializer.interceptor.spec.ts` | 19 |
| Cloisonnement multi-tenant (IDOR) | `src/common/guards/organisation.guard.spec.ts` | 16 |
| **Total** | | **35** |

---

## 4. Ce qui est couvert

### 4.1 Corruption numérique — la régression la plus coûteuse de l'ERP

Deux verrous complémentaires, un de chaque côté du réseau :

**Côté API — `DecimalSerializerInterceptor` (19 tests).** Prisma renvoie les montants en objets
`Decimal` qui se sérialisent en chaînes JSON. Sont vérifiés :

- conversion en `number` d'un `Decimal` racine, imbriqué, en tableau, en tableau de tableaux,
  et jusqu'à 5 niveaux de profondeur ;
- détection d'un `Decimal` par `constructor.name` **ou** par sa propriété interne `d` ;
- repli sur `toString()` quand `toNumber()` ne renvoie pas un nombre fini ;
- conversion des `BigInt` (racine, imbriqués, en tableau) ;
- **non-altération** de `Date` (instance préservée), `Buffer`, `null`, `undefined`, chaînes,
  booléens, nombres — et notamment qu'une chaîne numérique `"22000000"` reste une **chaîne** ;
- préservation du prototype des DTO (instances de classe métier) ;
- non-blocage sur une structure circulaire ;
- cas réel : réponse paginée `{ data[], meta }` dont la somme des cotisations est bien
  arithmétique (`75000`) et non concaténée.

**Côté front — `toNum()` / `formatMontant()` (30 tests).** Nombres, chaînes brutes
(`"22000000"`), décimales, notation scientifique, espaces (y compris insécables), virgule
décimale française, `null`, `undefined`, `NaN`, `±Infinity`, booléens, objets, tableaux,
fonctions, `Symbol`. Test d'invariant : un `reduce` sur un jeu hétérogène produit une **addition**
(`37 850 000`), jamais une concaténation. `formatMontant()` ne lève jamais et ne produit jamais
la chaîne « NaN ».

### 4.2 Sécurité multi-tenant — `OrganisationGuard` (16 tests)

- Refus (`ForbiddenException`) quand l'`organisationId` demandé diffère de celui du token, que
  l'identifiant vienne des **params** (`organisationId` ou `orgId`), de la **query** ou du **body**.
- Refus maintenu pour tous les rôles privilégiés non `SUPER_ADMIN` (`ADMIN`, `DIRECTEUR`,
  `COMPTABLE`, `TRESORIER`).
- La comparaison est sensible à la casse : un identifiant en majuscules est un autre tenant.
- Un body « propre » ne blanchit pas un param appartenant à une autre organisation.
- Autorisation de sa propre organisation et des requêtes sans `organisationId` explicite.
- `SUPER_ADMIN` exempté ; requête non authentifiée refusée (`false`) ; token sans
  `organisationId` refusé avec le message dédié.
- `@SkipOrgCheck` court-circuite bien la vérification ; la clé de métadonnée est verrouillée.

### 4.3 Moteur d'export PDF (108 tests)

- **Existant conservé (73)** : invariants de largeur minimale par type de colonne, non-débordement
  de la largeur utile, plancher de lisibilité de la police, taux d'occupation ≥ 0,85, choix
  d'orientation piloté par le contenu, équilibrage de la dernière page, robustesse aux accents et
  apostrophes ivoiriennes — sur 3 jeux de colonnes × 7 volumes (1 → 500 lignes).
- **Ajouté (35)** : `detectCorruptedChars` (mojibake, caractère de remplacement, emojis,
  titre/sous-titre), `validateLayout` (rapport de pages, débordement, police sous le plancher,
  en-tête trop haut, caractères corrompus), `pickNextCandidate` (re-composition), `cellText`
  (valeurs nulles, chemins imbriqués `a.b`, formateurs personnalisés), `createMeasurer`
  (largeurs, retour à la ligne, coupure de mot long, percentiles, non-mutation de la source),
  et cohérence des `COLUMN_RULES` / `abbreviate` / `effectivePriority`.

### 4.4 Assistant SARA (38 tests)

- **Garde-fous (18)** : rejet des entrées non tabulaires et malformées ; **suppression
  systématique de tout message `system` envoyé par le navigateur** (protection contre l'injection
  de prompt) ; troncature à `maxInputChars` ; fenêtre d'historique `maxHistoryTurns` ; budget
  global `maxContextChars` ; extraction correcte du dernier message *utilisateur* ; quotas de
  session (limite, isolation entre sessions, réinitialisation) ; `redactSecrets` masque les clés
  Groq / OpenAI / Anthropic et les affectations `*_API_KEY` sans altérer un texte normal.
- **Base de connaissances (20)** : intégrité du corpus, pertinence (tarifs, conformité SYCEBNL,
  essai gratuit, contacts), tri décroissant des scores, respect de la limite de passages,
  insensibilité casse/accents/ponctuation, **silence total sur les requêtes hors-sujet**, et
  `buildKnowledgeContext` qui cite bien la source.

### 4.5 Centre d'aide (16 tests)

Seuil des 2 caractères, insensibilité casse/accents, recherche dans les `motsCles` non affichés,
silence sur les requêtes absurdes, forme et provenance des résultats, ordre guide → FAQ → cas,
et intégrité du corpus éditorial (identifiants uniques, champs obligatoires non vides).

---

## 5. Bugs réels découverts (aucun n'a été masqué)

### 🐛 BUG-1 — SARA : faux positifs de recherche par sous-chaîne (moyen)

**Fichier** : `apps/web/src/lib/sara/knowledge.ts`, fonction `searchKnowledge`.

`searchKnowledge` teste l'appartenance d'un token au contenu avec
`normalizedContent.includes(token)` : une **sous-chaîne** suffit, sans frontière de mot. Des
questions totalement hors périmètre obtiennent donc un score > 0 et un passage non pertinent est
injecté dans le prompt système :

| Question hors-sujet | Token | Sous-chaîne trouvée dans | Passage injecté à tort |
|---|---|---|---|
| « Qui a gagné la finale de football hier soir ? » | `hier`, `gagne` | « fic**hier**s », « **gagne**r du temps » | `benefices` (score 2) |
| « Donne-moi le cours du bitcoin. » | `donne`, `moi` | « **donne**es », « **moi**s » | `securite` (3), `tarifs` (1), `migration-formation` (1) |

`sharePrefix` (racine commune ≥ 4 caractères) amplifie l'effet côté mots-clés (`donne` ↔ `donnees`).

**Conséquence** : sur une question hors sujet, SARA reçoit un contexte « OFFICIEL » sans rapport,
présenté comme *seule source autorisée* — ce qui augmente le risque d'hallucination au lieu de le
réduire.

**Correctif suggéré (NON appliqué — hors périmètre de la mission tests)** : comparer sur des mots
entiers (`new Set(normalizedContent.split(' '))` au lieu de `includes`) et exiger un score
plancher avant injection. Un seuil de **4** suffit : les faux positifs plafonnent à 3, alors
qu'une vraie question métier (« Combien coûte le plan Pro ? ») dépasse largement ce seuil. Ce
constat est lui-même testé (`knowledge.test.ts` → *un score plancher de 4 suffirait…*).

Les trois tests du bloc `[BUG CONNU]` **verrouillent le comportement actuel** : le jour où le
correctif est appliqué, ils échoueront et signaleront explicitement le changement.

### ⚠️ LIMITE-1 — `toNum()` et les séparateurs de milliers anglo-saxons (faible)

**Fichier** : `apps/web/src/lib/utils.ts`.

`value.replace(',', '.')` ne remplace que la **première** virgule. Une chaîne au format
anglo-saxon (`"1,234,567"`) devient `"1.234,567"` → `NaN` → **0**. Ce n'est pas un chemin réel de
l'ERP (Prisma sérialise les `Decimal` en brut, `"1234567"`), donc aucun correctif n'a été appliqué,
mais le comportement est verrouillé par un test explicite pour éviter toute dérive silencieuse.
Correctif si le besoin apparaît : `replace(/,/g, '.')` ne suffit pas non plus — il faudrait
distinguer séparateur décimal et séparateur de milliers.

### ⚠️ LIMITE-2 — `toNum()` ne gère pas un objet `Decimal` brut (faible)

`toNum({ toNumber: () => 22000000 })` renvoie **0**. C'est acceptable dans l'architecture actuelle
(le `DecimalSerializerInterceptor` convertit côté API avant la sortie HTTP), mais cela signifie que
le front n'a **aucun filet** si un `Decimal` non sérialisé lui parvenait par un autre canal
(WebSocket, réponse hors intercepteur). Comportement documenté par un test.

### ℹ️ REMARQUE — les `*.spec.ts` de l'API sont compilés dans `dist/`

`apps/api` n'a ni `nest-cli.json` ni `tsconfig.build.json` : `nest build` compile donc aussi les
fichiers de test dans `dist/`. C'est sans effet fonctionnel (rien ne les importe, `dist/main` reste
l'entrée), mais ajouter `"**/*.spec.ts"` au tableau `exclude` de `apps/api/tsconfig.json`
nettoierait la sortie. Non appliqué : `tsconfig.json` est hors du périmètre de cette mission.

---

## 6. Ce qui n'est PAS couvert (honnêtement)

| Non couvert | Détail |
|---|---|
| **Tests end-to-end** | Aucun. Pas de Playwright/Cypress, aucun parcours utilisateur réel (connexion → saisie d'écriture → export). Le script `test:e2e` d'`apps/api` référence un `jest-e2e.json` **qui n'existe pas**. |
| **Tests d'intégration base de données** | Aucun. Aucun test ne touche PostgreSQL ni Prisma. Les schémas, migrations, contraintes d'unicité, transactions et requêtes agrégées ne sont pas vérifiés. |
| **Contrôleurs / services NestJS** | Aucun des ~40 modules métier (membres, cotisations, comptabilité SYCEBNL, paie, projets/MEAL, achats/stocks…) n'a de test. Seuls deux éléments transverses de `common/` sont couverts. |
| **Authentification** | `JwtAuthGuard`, `LocalAuthGuard`, `RolesGuard`, le refresh token 15 min et les stratégies Passport ne sont pas testés. |
| **Composants React / pages** | Aucun test de rendu. Pas de `@testing-library/react`, pas de jsdom, aucun test de hook (`useApi`, `useMutation`), de store Zustand ni de formulaire. |
| **Rendu PDF/Excel effectif** | Seule la **composition** (calculs de layout) est testée. `pdf-renderer.ts`, `xlsx-engine.ts`, `csv-engine.ts` et `font-manager.ts` ne produisent aucun fichier vérifié — aucun contrôle du binaire généré ni des glyphes réellement dessinés. |
| **Providers SARA** | Les appels HTTP réels (`anthropic.ts`, `openai-compatible.ts`, `http.ts`), `engine.ts` et `telemetry.ts` ne sont pas testés (pas de mock réseau). |
| **Exports & imports de données** | `src/lib/export.ts`, les imports Excel/CSV et les modèles d'import ne sont pas testés. |
| **WebSockets, jobs BullMQ, cache Redis, envoi d'emails, S3** | Aucun test. |
| **Couverture chiffrée** | Aucun seuil de couverture n'est imposé ni mesuré en continu ; aucun test n'est branché en CI. |
| **Accessibilité, performance, charge** | Hors périmètre, non traités. |

### Prochaines priorités suggérées

1. `jest-e2e.json` manquant → soit le créer, soit retirer le script `test:e2e` mort.
2. Tests des guards d'authentification (`JwtAuthGuard`, `RolesGuard`) — même criticité sécurité que
   `OrganisationGuard`.
3. Tests d'intégration Prisma sur une base jetable (Docker) pour les agrégats financiers
   (balance SYCEBNL, soldes, totaux de cotisations) — c'est là que la corruption numérique est née.
4. Branchement des deux suites en CI (après avoir retiré `dependsOn: ["^build"]` de la tâche
   `test` dans `turbo.json`).
