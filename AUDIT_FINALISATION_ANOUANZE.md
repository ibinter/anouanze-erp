# AUDIT_FINALISATION_ANOUANZÊ.md
> Éditeur : IBIG Soft — IBIG SARL – Intermark Business International Group  
> Logiciel : ANOUANZÊ ERP — Gestion d'associations, ONG et organisations à but non lucratif  
> Domaine : https://anouanze.ibigsoft.com  
> Date d'audit : 2026-07-12  
> Auditeur : Claude Code (IA IBIG Soft)  
> Version du projet : 1.0.0-pre-commercial  
> Statut : EN COURS D'AUDIT — PHASE 1 TERMINÉE

---

## 1. ARCHITECTURE DÉTECTÉE

| Composant | Technologie | Version | Port |
|---|---|---|---|
| Monorepo | Turborepo + npm workspaces | Turbo v2 | — |
| Base de données | PostgreSQL | 16 | 5432 |
| ORM | Prisma | 5 | — |
| Cache / Files | Redis + BullMQ | — | 6379 |
| Backend API | NestJS | 10 | 4000 |
| Frontend Web | Next.js App Router | 14 | 3099 (prod) |
| App mobile | Expo / React Native | 51 | — |
| Stockage fichiers | MinIO / S3 compatible | — | 9000 |
| Conteneurisation | Docker Compose | — | — |
| CI/CD | Pas encore configuré | — | — |

**Norme comptable :** SYCEBNL (OHADA — associations et ONG)  
**Multi-tenancy :** isolation par `organisationId` dans JWT + filtre Prisma par module  
**Infra prod :** VPS Debian (185.98.139.38), nginx reverse proxy, HTTPS Let's Encrypt ✅

---

## 2. ÉTAT GÉNÉRAL DU PROJET

| Dimension | État | Note |
|---|---|---|
| Architecture | ✅ Solide | Monorepo bien structuré, séparation API/Web/Mobile |
| Base de données | ✅ Complète | 27+ tables, 13 enums, 1 migration init propre |
| Authentification | ✅ Fonctionnelle | JWT 15min + refresh 7j, sessions DB, bcrypt |
| Multi-tenancy | ✅ Implémenté | organisationId dans JWT et dans chaque requête |
| Déploiement prod | ✅ Opérationnel | 4 containers actifs, HTTPS, nginx |
| Interface utilisateur | ⚠️ Partielle | Pages créées mais données statiques / formulaires incomplets |
| Commercialisation | ❌ Absente | Pas de page de vente, pas de système de licences |
| Superadmin IBIG Soft | ❌ Absent | Aucune console Superadmin |
| Multilingue (FR/EN) | ❌ Absent | Tout en français, pas d'i18n |
| Exports PDF/XLSX | ❌ Absents | Pas de fonctionnalité d'export visible |
| Emails automatiques | ⚠️ Partiel | Module email présent (nodemailer), templates non créés |
| Sécurité | ⚠️ Partielle | HTTPS ✅, 2FA déclaré mais non implémenté |
| Guide utilisateur | ❌ Absent | — |
| Centre d'aide / tickets | ❌ Absent | — |
| Assistant IA | ⚠️ Partiel | Module IA présent, page `/ia` présente, clé OpenAI non configurée |
| Analytics | ❌ Absent | — |
| Tests | ❌ Absents | Aucun test unitaire ni fonctionnel détecté |
| Documentation | ❌ Absente | Pas de guide d'installation ni de README complet |

---

## 3. FONCTIONNALITÉS PRÉSENTES ET OPÉRATIONNELLES

| Module | État | Détail |
|---|---|---|
| Authentification (login/logout/refresh) | ✅ | JWT + NextAuth + sessions DB |
| Gestion des membres | ✅ API | CRUD complet en backend + page web |
| Gestion des cotisations | ✅ API | Liée aux membres |
| Gestion des donateurs et dons | ✅ API | Types numéraire + en nature |
| Gestion des bailleurs et conventions | ✅ API | Avec décaissements |
| Projets, programmes, activités | ✅ API | Hiérarchie parent-enfant, statuts |
| Bénéficiaires | ✅ API | Avec vulnérabilités + liaison projets |
| Ressources humaines (employés, congés, paie) | ✅ API | Fiches de paie générées |
| Volontaires | ✅ API | Compétences, disponibilités |
| Comptabilité SYCEBNL | ✅ API | Plan de comptes 130+ comptes, journaux, écritures |
| Budget | ✅ API | Budgets par exercice + lignes |
| Trésorerie | ✅ API | Comptes bancaires, mouvements, rapprochement |
| Achats / fournisseurs | ✅ API | Commandes d'achat |
| Stocks | ✅ API | Mouvements entrée/sortie/ajustement |
| Documents (GED) | ✅ API | Upload S3, versionnage, statuts |
| Événements | ✅ API | Types AG/Réunion/Formation |
| Immobilisations | ✅ API | Avec amortissement et cession |
| MEAL (Suivi-Évaluation) | ✅ API | Indicateurs + collecte de données |
| Audit logs | ✅ API | Intercepteur automatique sur toutes les mutations |
| Notifications WebSocket | ✅ API | Temps réel via Socket.io |
| Paiements mobiles (Orange Money, MTN, Wave, CinetPay) | ⚠️ | Architecture présente, clés API manquantes |
| Assistant IA | ⚠️ | Chat + analyse BI présents, nécessite clé OpenAI |
| Reporting / BI | ⚠️ | Page présente, graphiques Recharts, données à connecter |
| Dashboard | ⚠️ | Cartes KPI + graphiques, données à vérifier (réelles vs fictives) |

---

## 4. FONCTIONNALITÉS INCOMPLÈTES

| Fonctionnalité | État | Problème identifié |
|---|---|---|
| Page `/budget` | ❌ | Dans la Sidebar, pas de `page.tsx` |
| Page `/gouvernance` | ❌ | Lien sidebar, pas de page |
| 2FA | ❌ | Champs en DB, pas de code d'implémentation |
| Emails automatiques | ❌ | Module nodemailer présent, templates non créés |
| Système de licences | ❌ | Absent |
| Superadmin console | ❌ | Absent |
| Page de vente publique | ❌ | Absent — seule la page `/login` existe en public |
| CRM prospects | ❌ | Absent |
| Gestion démonstrations | ❌ | Absent |
| Offres et tarifs | ❌ | Absent |
| Centre d'aide / tickets | ❌ | Absent |
| Guide utilisateur | ❌ | Absent |
| Export PDF | ❌ | Absent |
| Export XLSX | ❌ | Absent |
| Multilingue (anglais) | ❌ | Absent |
| Onboarding nouvel utilisateur | ❌ | Absent |
| Recherche globale | ❌ | Absent |
| Mode sombre | ❌ | Non implémenté |
| Gestion des permissions granulaires (UI) | ❌ | `permissions[]` est un array non contraint en DB |
| OAuth Google / Microsoft | ❌ | Dépendances déclarées, non câblées |
| SMS (Vonage) | ❌ | Config présente, non câblé |
| Analytics produit | ❌ | Absent |
| Tests | ❌ | Aucun test existant |
| Politique RGPD / cookies / CGU | ❌ | Absent |

---

## 5. BUGS ET RISQUES IDENTIFIÉS

### Bugs critiques
| Bug | Fichier | Priorité |
|---|---|---|
| Double `/api/v1` dans `API_URL` (corrigé en prod, pas en `.env.example`) | `.env.example` + `route.ts` | HAUTE |
| `API_URL=http://api:4000/api/v1` + code `${apiUrl}/api/v1/auth/login` = double préfixe | `.env.example` | HAUTE |
| Page `/budget` liée dans Sidebar mais inexistante | `Sidebar.tsx` | HAUTE |
| Page `/gouvernance` liée dans Sidebar mais inexistante | `Sidebar.tsx` | HAUTE |

### Bugs majeurs
| Bug | Localisation | Priorité |
|---|---|---|
| Dashboard potentiellement avec données statiques (graphiques) | `DashboardCharts.tsx` | HAUTE |
| Permissions granulaires non validées (chaînes libres non contraintes) | `UtilisateurOrganisation.permissions[]` | HAUTE |
| Clé `ENCRYPTION_KEY` non utilisée ou non vérifiée au démarrage | `.env.example` + `AppModule` | MOYENNE |

### Risques sécurité
| Risque | Localisation | Priorité |
|---|---|---|
| 2FA annoncé dans l'UI potentiellement mais non fonctionnel | `Utilisateur.deuxFacteurs` | HAUTE |
| Secrets JWT placeholder dans `.env.example` (doivent être changés) | `.env.example` | HAUTE |
| Pas de rate limiting visible au niveau NestJS (déclaré dans `.env` mais à vérifier) | `AppModule` | MOYENNE |
| Upload S3 : validation MIME non vérifiée (besoin de vérification côté serveur) | `StorageModule` | MOYENNE |
| Aucun test de sécurité (IDOR, injection, accès horizontal) | Global | HAUTE |

### Risques techniques
| Risque | Note |
|---|---|
| Pas de CI/CD | Tout déploiement est manuel — risque de régression en prod |
| Une seule migration initiale | Toutes les évolutions futures nécessiteront des migrations propres |
| App mobile Expo non intégrée dans le pipeline prod | Expo non dockerisé |
| Module IA dépendant d'OpenAI uniquement | Couplage fort, pas de fallback fournisseur |
| Paiements non testés en production | Clés API manquantes |

---

## 6. ÉCARTS PAR RAPPORT AU CAHIER DES CHARGES (PROMPT MAÎTRE)

| Exigence | Module | État actuel | Action nécessaire |
|---|---|---|---|
| Page de vente publique haute conversion | — | ❌ Absent | Créer de zéro |
| Système de licences SaaS | — | ❌ Absent | Créer de zéro |
| Console Superadmin IBIG Soft | — | ❌ Absent | Créer de zéro |
| CRM prospects et pipeline | — | ❌ Absent | Créer de zéro |
| Gestion des démonstrations | — | ❌ Absent | Créer de zéro |
| Emails automatiques (séquence complète) | — | ⚠️ Module nodemailer présent | Créer templates + triggers |
| Multilingue français + anglais | — | ❌ Français uniquement | Implémenter i18n |
| Exports PDF professionnels | Tous modules | ❌ Absent | Implémenter |
| Exports XLSX professionnels | Tous modules | ❌ Absent | Implémenter |
| Guide utilisateur (web + PDF) | — | ❌ Absent | Créer |
| Centre d'aide + tickets support | — | ❌ Absent | Créer |
| Assistant IA commercial (page publique) | — | ❌ Absent | Créer |
| Assistant IA interne multi-fournisseurs | `/ia` | ⚠️ OpenAI uniquement | Étendre à Groq, Anthropic, Mistral |
| Tableaux de bord dynamiques (données réelles) | Dashboard | ⚠️ À vérifier | Connecter aux données réelles |
| Onboarding utilisateur | — | ❌ Absent | Créer |
| Recherche globale | — | ❌ Absent | Créer |
| Paiements en ligne (CinetPay, Wave, MTN, Orange) | — | ⚠️ Architecture prête | Câbler les clés + webhooks |
| Tests (fonctionnels, sécurité, graphiques) | — | ❌ Absent | Créer |
| Données de démo réinitalisables | Seed | ⚠️ Seed statique | Ajouter reset automatisé |
| Pages légales (CGU, confidentialité, mentions) | — | ❌ Absent | Créer |
| SEO et performance page publique | — | ❌ Absent | Optimiser |
| Journal d'audit consultable + exportable | `/audit` | ⚠️ Backend complet | Finaliser UI |
| Notifications multi-canaux (email + SMS + web) | — | ⚠️ WebSocket présent | Étendre |
| Sauvegardes et restauration | — | ❌ Absent | Implémenter |
| 2FA | — | ⚠️ Champs présents | Implémenter TOTP |
| Politique de sécurité des sessions | — | ⚠️ Partielle | Renforcer |

---

## 7. ÉTAT DE L'IDENTITÉ VISUELLE

| Élément | État | Note |
|---|---|---|
| Logo officiel ANOUANZÊ | ❌ À vérifier | Dépend des assets dans `/public` |
| Favicon | ❌ Probablement absent ou générique | À créer |
| Couleurs principales | ⚠️ TailwindCSS present | Variables CSS non centralisées |
| Typographie | ⚠️ Inter (Next.js default) | Harmonisation à confirmer |
| Composants UI | ⚠️ Radix UI + Tailwind | Cohérence à vérifier entre pages |
| Identité sur page de connexion | ⚠️ Minimal | Pas de logo/marque visible |
| Emails brandés | ❌ Templates non créés | — |
| Documents PDF brandés | ❌ Non implémenté | — |
| Mode clair/sombre | ❌ Mode sombre absent | Mode clair uniquement |

---

## 8. PLAN D'EXÉCUTION PAR PHASES

### Phase 1 — Audit ✅ TERMINÉE
- Architecture analysée, bugs identifiés, cartographie complète

### Phase 2 — Corrections critiques et socle (PRIORITÉ 1)
**Durée estimée : 3-5 jours**
1. Corriger les pages manquantes (`/budget`, `/gouvernance`)
2. Corriger `API_URL` dans `.env.example` (supprimer le double `/api/v1`)
3. Connecter le dashboard aux données réelles (API `/dashboard` ou agrégation)
4. Vérifier et sécuriser chaque module : test IDOR basique
5. Implémenter le rate limiting NestJS (ThrottlerModule)
6. Implémenter la validation MIME pour les uploads
7. Ajouter les en-têtes de sécurité HTTP (helmet)
8. Implémenter le reset du mot de passe
9. Implémenter la 2FA TOTP

### Phase 3 — Expérience produit (PRIORITÉ 2)
**Durée estimée : 5-7 jours**
1. Vérifier et finaliser les formulaires de chaque module
2. Implémenter les exports PDF (factures, rapports, fiches de paie)
3. Implémenter les exports XLSX (listes, mouvements, journaux)
4. Implémenter les impressions
5. Centraliser les couleurs + tokens de design (fichier `globals.css` + variables)
6. Harmoniser l'identité visuelle (logo, favicon, palette)
7. Améliorer la page de connexion (logo, marque, UX)
8. Ajouter la recherche globale

### Phase 4 — Commercialisation (PRIORITÉ 3)
**Durée estimée : 7-10 jours**
1. Créer la page de vente publique haute conversion
2. Créer le système de licences SaaS (DB + API + UI)
3. Créer la console Superadmin IBIG Soft
4. Créer le CRM prospects et pipeline commercial
5. Câbler les paiements (CinetPay + Wave en priorité)
6. Créer les emails automatiques (séquence complète)
7. Implémenter le multilingue FR/EN

### Phase 5 — Assistance et support (PRIORITÉ 4)
**Durée estimée : 4-6 jours**
1. Centre d'aide et base de connaissances
2. Système de tickets support
3. Assistant IA interne multi-fournisseurs (Groq gratuit par défaut)
4. Assistant IA public sur page de vente
5. Guide utilisateur (web + PDF téléchargeable)
6. Onboarding nouvel utilisateur

### Phase 6 — Tests, performance et livraison (PRIORITÉ 5)
**Durée estimée : 3-5 jours**
1. Tests fonctionnels critiques
2. Tests de sécurité (IDOR, permissions)
3. Optimisation performances (queries N+1, pagination, index)
4. SEO page publique
5. Pages légales (CGU, confidentialité, mentions légales)
6. Documentation technique complète
7. CI/CD GitHub Actions

---

## 9. FICHIERS ET MODULES À MODIFIER

### Corrections immédiates
- `apps/web/src/components/layout/Sidebar.tsx` — liens morts
- `apps/web/src/app/(dashboard)/budget/page.tsx` — à créer
- `apps/web/src/app/(dashboard)/gouvernance/page.tsx` — à créer
- `.env.example` — corriger `API_URL`

### Nouveaux modules API
- `apps/api/src/modules/licences/` — système de licences SaaS
- `apps/api/src/modules/superadmin/` — console IBIG Soft
- `apps/api/src/modules/prospects/` — mini-CRM
- `apps/api/src/modules/support/` — tickets d'aide
- `apps/api/src/modules/exports/` — PDF + XLSX

### Nouvelles pages web
- `apps/web/src/app/(public)/` — page de vente + landing
- `apps/web/src/app/(superadmin)/` — console Superadmin IBIG Soft
- `apps/web/src/app/(dashboard)/aide/` — centre d'aide
- `apps/web/src/app/(dashboard)/onboarding/` — parcours nouvel utilisateur

### Design et tokens
- `apps/web/src/app/globals.css` — variables CSS centralisées
- `apps/web/public/` — logo, favicon, images de marque

---

## 10. MIGRATIONS PRÉVUES

| Migration | Tables créées / modifiées | Phase |
|---|---|---|
| `add_licences` | `licences`, `offres_licences`, `paiements_licence` | 4 |
| `add_prospects` | `prospects`, `pipeline_commercial`, `activites_crm` | 4 |
| `add_tickets_support` | `tickets`, `reponses_ticket`, `articles_aide` | 5 |
| `add_fournisseur_ia` | `fournisseurs_ia`, `logs_ia` | 5 |
| `add_2fa` | Colonnes sur `Utilisateur` (déjà présentes) | 2 |
| `add_email_log` | `logs_email` | 4 |

---

## 11. RISQUES DE RÉGRESSION

| Risque | Mesure de protection |
|---|---|
| Modifier le JWT payload (ajout de claims) | Invalider toutes les sessions actives après migration |
| Modifier le schéma Prisma | Tester les seeds + données existantes avant migration prod |
| Ajouter des guards de permission | Tester chaque module avec les rôles existants |
| Modifier le `Sidebar.tsx` | Tester tous les liens de navigation |
| Modifier le `docker-compose.prod.yml` | Backup et test de redémarrage complet |

---

## 12. QUESTIONS BLOQUANTES

> Aucune question bloquante critique — le prompt maître est suffisamment complet pour commencer. Les points suivants sont à confirmer dès que possible :

1. **Logo et charte graphique officielle ANOUANZÊ** : y a-t-il un fichier logo PNG/SVG disponible ? Quelle est la palette de couleurs officielle (code hex) ?
2. **Clé OpenAI** : une clé sera-t-elle fournie pour l'IA, ou utiliser Groq (gratuit) par défaut ?
3. **Paiements** : quelle passerelle prioriser en premier ? (recommandation : CinetPay — couverture Afrique de l'Ouest + intégration simple)
4. **SMTP** : y a-t-il un serveur email IBIG Soft configuré, ou utiliser un service tiers (Resend, Mailgun) ?
5. **Nom de domaine final** : quand `anouanze-erp.com` sera acquis, prévoir mise à jour nginx + env vars

---

## 13. CRITÈRES DE RECETTE PROPOSÉS

Le projet sera considéré prêt à la commercialisation quand :
- [ ] Toutes les pages du Sidebar fonctionnent sans erreur
- [ ] Le dashboard affiche des données réelles depuis la base
- [ ] Les exports PDF et XLSX fonctionnent dans au moins 5 modules clés
- [ ] Le système de licences est opérationnel (essai + paiement + activation)
- [ ] La page de vente est en ligne et accessible publiquement
- [ ] La console Superadmin permet de gérer clients, licences et paiements
- [ ] Les emails automatiques partent (inscription, relance, expiration)
- [ ] L'anglais est disponible en tant que langue alternative
- [ ] Les permissions sont contrôlées côté serveur (test IDOR réussi)
- [ ] 2FA TOTP fonctionne
- [ ] Guide utilisateur PDF téléchargeable disponible
- [ ] Centre d'aide avec tickets actif
- [ ] Assistant IA interne répond aux questions sur le logiciel
- [ ] Aucun lien mort dans la navigation
- [ ] Aucune donnée fictive codée en dur dans les graphiques de production

---

## 14. JOURNAL DES INTERVENTIONS

| Date | Phase | Action | Fichiers | Statut |
|---|---|---|---|---|
| 2026-07-12 | 1 | Audit initial complet | Tout le projet | ✅ TERMINÉ |

---

*Document maintenu par Claude Code — IBIG Soft*  
*Mis à jour automatiquement après chaque phase d'intervention*
